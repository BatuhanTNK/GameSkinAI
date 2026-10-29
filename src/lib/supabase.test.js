jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    functions: { invoke: jest.fn() },
    storage: { from: jest.fn() },
  }),
}));
jest.mock('./imageValidator', () => ({ validateImageMagicBytes: jest.fn() }));

process.env.REACT_APP_SUPABASE_URL = 'https://test.supabase.co';
process.env.REACT_APP_SUPABASE_ANON_KEY = 'test-publishable-key';
const { supabase, invokeEdgeFunction, uploadImage, uploadBase64Image } = require('./supabase');
const { validateImageMagicBytes } = require('./imageValidator');

beforeEach(() => {
  jest.resetAllMocks();
  validateImageMagicBytes.mockResolvedValue({ isValid: true, detectedType: 'image/png' });
});

test('Edge Function JSON error is shown instead of the generic HTTP error', async () => {
  supabase.functions.invoke.mockResolvedValue({ error: {
    message: 'non-2xx', context: { status: 503, json: async () => ({ error: 'Gemini API key missing' }) },
  } });
  await expect(invokeEdgeFunction('convert', {})).rejects.toThrow('Gemini API key missing');
  await expect(invokeEdgeFunction('convert', {})).rejects.toHaveProperty('status', 503);
});

test('network failure explains the Supabase connection problem', async () => {
  supabase.functions.invoke.mockResolvedValue({ error: { name: 'FunctionsFetchError', message: 'Failed to fetch' } });
  await expect(invokeEdgeFunction('convert', {})).rejects.toThrow('Supabase sunucusuna ulaşılamıyor');
});

test('storage RLS failure is not silently converted into a local image', async () => {
  supabase.storage.from.mockReturnValue({ upload: jest.fn().mockResolvedValue({ error: { message: 'RLS denied' } }) });
  await expect(uploadImage(new File(['png'], 'photo.png'))).rejects.toThrow('RLS denied');
});

test('private storage URL failure is not replaced with an inaccessible public URL', async () => {
  supabase.storage.from.mockReturnValue({
    upload: jest.fn().mockResolvedValue({ error: null }),
    createSignedUrl: jest.fn().mockResolvedValue({ error: { message: 'select denied' } }),
  });
  await expect(uploadImage(new File(['png'], 'photo.png'))).rejects.toThrow('select denied');
});

test('data URL MIME is preserved when storing Gemini output', async () => {
  const upload = jest.fn().mockResolvedValue({ error: null });
  supabase.storage.from.mockReturnValue({
    upload,
    createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://signed.example/image' }, error: null }),
  });
  await expect(uploadBase64Image('data:image/png;base64,cG5n')).resolves.toBe('https://signed.example/image');
  expect(upload.mock.calls[0][1].type).toBe('image/png');
});
