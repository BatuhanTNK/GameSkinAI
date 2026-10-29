import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Lokal geliştirme (Antigravity dahili önizleme) için sunucu tarafı Gemini/Görsel proxy eklentisi.
 * Opera/harici tarayıcı OAuth yönlendirmesine gerek kalmadan .env.local içindeki GEMINI_API_KEY
 * ile gerçek Gemini 2.5 Flash analizini ve görsel üretimini localhost üzerinde çalıştırır.
 */
function localConvertApiPlugin(apiKey) {
  return {
    name: 'local-convert-api',
    configureServer(server) {
      server.middlewares.use('/__dev/convert', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        let raw = '';
        for await (const chunk of req) raw += chunk;
        try {
          const body = JSON.parse(raw || '{}');
          const { action, imageBase64, mimeType, themePrompt, isJson, responseSchema, prompt } = body;
          const key = (apiKey || '').trim();
          if (!key) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'GEMINI_API_KEY .env.local içinde tanımlı değil.' }));
            return;
          }

          if (action === 'analyze') {
            const modelName = 'gemini-2.5-flash';
            const aiResp = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: themePrompt }, { inlineData: { mimeType, data: imageBase64 } }] }],
                  generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048,
                    thinkingConfig: { thinkingBudget: 0 },
                    ...(isJson ? { responseMimeType: 'application/json', ...(responseSchema ? { responseSchema } : {}) } : {}),
                  },
                }),
              }
            );
            if (aiResp.ok) {
              const data = await aiResp.json();
              const textContent = data.candidates?.[0]?.content?.parts
                ?.filter((p) => !p.thought && p.text)
                .map((p) => p.text)
                .join('');
              if (textContent) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ description: textContent, modelUsed: modelName }));
                return;
              }
            }
            const errBody = await aiResp.text();
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Gemini analiz hatası (${aiResp.status}): ${errBody.slice(0, 200)}` }));
            return;
          }

          if (action === 'generateImage') {
            // 1. Önce Gemini görsel modelini dene (ücretli anahtar varsa doğrudan çalışır)
            const parts = [];
            if (imageBase64) parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } });
            parts.push({ text: prompt });
            try {
              const imgResp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                  body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
                  }),
                }
              );
              if (imgResp.ok) {
                const data = await imgResp.json();
                const image = data.candidates?.[0]?.content?.parts?.find((p) => !p.thought && p.inlineData?.data)?.inlineData;
                if (image?.data) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ imageBase64: image.data, mimeType: image.mimeType || 'image/png' }));
                  return;
                }
              }
            } catch (_) {
              // Ücretsiz anahtar kotası (429) durumunda aşağıdaki ücretsiz üretime geçilir
            }

            // 2. Ücretsiz görsel üretimi (768x832 istenip alt 64px filigran tarayıcıda kırpılır)
            const seed = Math.floor(Math.random() * 1000000);
            const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=832&nologo=true&seed=${seed}`;
            try {
              const polResp = await fetch(pollinationUrl);
              if (polResp.ok) {
                const buf = Buffer.from(await polResp.arrayBuffer());
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    imageBase64: buf.toString('base64'),
                    mimeType: polResp.headers.get('content-type') || 'image/jpeg',
                    cropWatermark: true,
                  })
                );
                return;
              }
            } catch (_) {
              // URL yedek olarak döndürülür
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ fallbackUrl: pollinationUrl, mimeType: 'image/jpeg', cropWatermark: true }));
            return;
          }

          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Geçersiz işlem' }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Sunucu hatası' }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .env dosyasındaki REACT_APP_ ve VITE_ değişkenlerini yükle
  const env = loadEnv(mode, process.cwd(), '');

  const isProd = mode === 'production';
  const basePath = isProd ? '/GameSkinAI/' : '/';
  const publicUrl = isProd ? '/GameSkinAI' : '';

  return {
    base: basePath,
    plugins: [react(), !isProd && localConvertApiPlugin(env.GEMINI_API_KEY)].filter(Boolean),
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
        components: path.resolve(__dirname, './src/components'),
        contexts: path.resolve(__dirname, './src/contexts'),
        hooks: path.resolve(__dirname, './src/hooks'),
        layouts: path.resolve(__dirname, './src/layouts'),
        lib: path.resolve(__dirname, './src/lib'),
        views: path.resolve(__dirname, './src/views'),
        assets: path.resolve(__dirname, './src/assets'),
        'routes.js': path.resolve(__dirname, './src/routes.js'),
        routes: path.resolve(__dirname, './src/routes.js'),
      },
    },
    define: {
      'process.env': JSON.stringify({
        REACT_APP_SUPABASE_URL: env.REACT_APP_SUPABASE_URL || '',
        REACT_APP_SUPABASE_ANON_KEY: env.REACT_APP_SUPABASE_ANON_KEY || '',
        NODE_ENV: isProd ? 'production' : 'development',
        PUBLIC_URL: publicUrl,
      }),
    },
    server: {
      port: 3000,
      open: false,
    },
    build: {
      outDir: 'build',
    },
  };
});
