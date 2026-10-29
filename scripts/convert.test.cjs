const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('supabase/functions/convert/index.ts', 'utf8')
  .replace(/^import .*;\r?\n/gm, '');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  reportDiagnostics: true,
});
assert.equal(compiled.diagnostics.length, 0);

function setup({ user = { id: 'test-user' }, key = 'test-gemini-api-key', fetchImpl } = {}) {
  let handler;
  const calls = [];
  const context = {
    Request, Response,
    console: { warn() {}, error() {} },
    Deno: { env: { get: (name) => ({ SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'test-anon-key', GEMINI_API_KEY: key })[name] } },
    createClient: () => ({ auth: { getUser: async () => ({ data: { user } }) } }),
    serve: (fn) => { handler = fn; },
    fetch: async (...args) => {
      calls.push(args);
      if (!fetchImpl) throw new Error('Unexpected provider request');
      return fetchImpl(...args);
    },
  };
  vm.runInNewContext(compiled.outputText, context);
  return {
    calls,
    request: (body, options = {}) => handler(new Request('https://test.supabase.co/functions/v1/convert', {
      method: 'POST', headers: { Authorization: `Bearer ${'invalid'.repeat(10)}`, Origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
      body: JSON.stringify(body), ...options,
    })),
  };
}

test('long forged token cannot invoke Gemini', async () => {
  const app = setup({ user: null });
  const res = await app.request({ action: 'analyze' });
  assert.equal(res.status, 401);
  assert.equal(app.calls.length, 0);
});

test('missing Gemini key returns 503 instead of a fabricated character', async () => {
  const missing = setup({ key: '' });
  const res = await missing.request({ action: 'analyze' });
  assert.equal(res.status, 503);
  assert.match((await res.json()).error, /GEMINI_API_KEY/);
  assert.equal(missing.calls.length, 0);
});

test('provider quota failure is an error and never calls another image service', async () => {
  for (const action of ['analyze', 'generateImage']) {
    const app = setup({ fetchImpl: async () => Response.json({ error: 'quota' }, { status: 429 }) });
    const res = await app.request({ action, prompt: 'character', imageBase64: 'photo', mimeType: 'image/png', themePrompt: 'Minecraft' });
    assert.equal(res.status, 502);
    assert.equal((await res.json()).description, undefined);
    assert.equal(app.calls.length, 1);
    assert.equal(new URL(app.calls[0][0]).hostname, 'generativelanguage.googleapis.com');
  }
});

test('Gemini images use generateContent and preserve PNG MIME', async () => {
  const app = setup({ fetchImpl: async () => Response.json({ candidates: [{ content: { parts: [
    { text: 'Here is your character' }, { inlineData: { mimeType: 'image/png', data: 'cG5n' } },
  ] } }] }) });
  const res = await app.request({ action: 'generateImage', prompt: 'Minecraft portrait' });
  assert.deepEqual(await res.json(), { imageBase64: 'cG5n', mimeType: 'image/png' });
  assert.match(app.calls[0][0], /gemini-2.5-flash-image:generateContent$/);
  assert.deepEqual(JSON.parse(app.calls[0][1].body).generationConfig.responseModalities, ['TEXT', 'IMAGE']);
});

test('text-only image response does not report successful generation', async () => {
  const app = setup({ fetchImpl: async () => Response.json({ candidates: [{ content: { parts: [{ text: 'Unable to generate' }] } }] }) });
  assert.equal((await app.request({ action: 'generateImage', prompt: 'character' })).status, 502);
});

test('analysis forwards the photo and schema and excludes thought text', async () => {
  const app = setup({ fetchImpl: async () => Response.json({ candidates: [{ content: { parts: [
    { thought: true, text: 'private reasoning' }, { text: '{"description":' }, { text: '"character"}' },
  ] } }] }) });
  const schema = { type: 'OBJECT', properties: { description: { type: 'STRING' } } };
  const res = await app.request({ action: 'analyze', imageBase64: 'photo', mimeType: 'image/png', themePrompt: 'Minecraft', isJson: true, responseSchema: schema });
  assert.equal((await res.json()).description, '{"description":"character"}');
  const body = JSON.parse(app.calls[0][1].body);
  assert.deepEqual(body.contents[0].parts[1].inlineData, { mimeType: 'image/png', data: 'photo' });
  assert.deepEqual(body.generationConfig.responseSchema, schema);
});

test('CORS preflight does not require authentication or Gemini', async () => {
  const app = setup({ user: null, key: '' });
  const res = await app.request(undefined, { method: 'OPTIONS' });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.equal(app.calls.length, 0);
});
