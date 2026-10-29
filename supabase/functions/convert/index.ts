import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const ALLOWED_ORIGINS = [
  "https://batuhantnk.github.io",
  "https://gameskin.batutnk.com.tr",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3005",
  "http://localhost:3006",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".github.io")) return true;
  return false;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// In-memory sliding window rate limiting per user ID or IP (max 10 requests per 60 seconds)
const userRequestHistory = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = userRequestHistory.get(key) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  recent.push(now);
  userRequestHistory.set(key, recent);
  return true;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || `Bearer ${supabaseAnonKey}` } },
    });

    const { data: { user: authUser } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));


    if (!authUser) {
      console.warn("Auth verification failed for token.");
      return new Response(
        JSON.stringify({ error: "Geçersiz veya yetkisiz oturum token'ı." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rateLimitKey = authUser?.id || req.headers.get("x-forwarded-for") || "anon-client";

    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyip tekrar deneyin." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, imageBase64, mimeType, themePrompt, isJson, responseSchema, prompt, allowFreeFallback } = body;

    const apiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API anahtarı sunucuda tanımlı değil (GEMINI_API_KEY)." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "listModels") {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey?.trim()}`);
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === "analyze") {
      if (apiKey && apiKey.trim().length > 10) {
        const candidateModels = [
          Deno.env.get("GEMINI_ANALYSIS_MODEL") || "gemini-2.5-flash",
        ];
        for (const modelName of candidateModels) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
          const requestBody = {
            contents: [
              {
                parts: [
                  { text: themePrompt },
                  { inlineData: { mimeType, data: imageBase64 } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
              // 2.5 modellerinde "thinking" token'ları maxOutputTokens'tan düşülüyor ve
              // açıklamayı yarıda kesiyordu (finishReason=MAX_TOKENS). Bu görev için düşünmeye gerek yok.
              ...(modelName.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
              ...(isJson ? { responseMimeType: "application/json", ...(responseSchema ? { responseSchema } : {}) } : {}),
            },
          };

          try {
            const aiResponse = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey.trim() },
              body: JSON.stringify(requestBody),
            });

            if (aiResponse.ok) {
              const data = await aiResponse.json();
              const textContent = data.candidates?.[0]?.content?.parts?.filter((part: any) => !part.thought && part.text).map((part: any) => part.text).join("");
              if (textContent) {
                return new Response(
                  JSON.stringify({ description: textContent, modelUsed: modelName }),
                  { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
              }
            } else {
              const errBody = await aiResponse.text();
              console.warn(`Model ${modelName} returned ${aiResponse.status}:`, errBody);
            }
          } catch (fetchErr: any) {
            console.warn(`Fetch error for ${modelName}:`, fetchErr);
          }
        }
      } else {
        console.warn("GEMINI_API_KEY is missing or invalid in Edge Function environment.");
      }

      return new Response(
        JSON.stringify({ error: "Gemini fotoğrafı analiz edemedi. Sunucudaki API anahtarını, model erişimini ve kotayı kontrol edin." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "generateImage") {
      const model = Deno.env.get("GEMINI_IMAGE_MODEL") || "gemini-2.5-flash-image";
      // Fotoğraf gönderildiyse görsel modeline referans olarak verilir (image-to-image).
      // Fotoğrafsız üretimde kişinin yüzü/kıyafeti kayboluyordu.
      const parts: any[] = [];
      if (imageBase64) parts.push({ inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } });
      parts.push({ text: prompt });

      const imgResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        }
      );
      if (imgResponse.ok) {
        const data = await imgResponse.json();
        const image = data.candidates?.[0]?.content?.parts?.find((part: any) => !part.thought && part.inlineData?.data)?.inlineData;
        if (image?.data) {
          return new Response(JSON.stringify({ imageBase64: image.data, mimeType: image.mimeType || "image/png" }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("Gemini image response had no image. finishReason:", data.candidates?.[0]?.finishReason, data.promptFeedback);
        return new Response(JSON.stringify({ error: "Gemini bu fotoğraf için görsel üretmedi (güvenlik filtresi olabilir). Farklı bir fotoğrafla deneyin." }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await imgResponse.text();
      console.error("Gemini image generation failed:", imgResponse.status, errText);

      // Ücretsiz Gemini API anahtarlarında görsel üretim kotası 0 (429) olduğundan,
      // istemci ücretsiz yedek üretimi istediyse Gemini 2.5 Flash'ın çıkardığı detaylı
      // görsel betimleme ile ücretsiz görsel servisi üzerinden üretim yapılır.
      if (allowFreeFallback) {
        const randomBuffer = new Uint32Array(1);
        crypto.getRandomValues(randomBuffer);
        const seed = randomBuffer[0] % 1000000;
        const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=832&nologo=true&seed=${seed}`;
        try {
          const polResp = await fetch(pollinationUrl);
          if (polResp.ok) {
            const bytes = new Uint8Array(await polResp.arrayBuffer());
            let binary = "";
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
              binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
            }
            const base64 = btoa(binary);
            return new Response(
              JSON.stringify({ imageBase64: base64, mimeType: polResp.headers.get("content-type") || "image/jpeg", cropWatermark: true }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          // Sunucu IP'si hız limitine takılırsa tarayıcı kendi IP'siyle yükleyebilsin
          return new Response(
            JSON.stringify({ fallbackUrl: pollinationUrl, mimeType: "image/jpeg", cropWatermark: true }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (polErr) {
          console.warn("Free image fallback fetch error, returning fallbackUrl:", polErr);
          return new Response(
            JSON.stringify({ fallbackUrl: pollinationUrl, mimeType: "image/jpeg", cropWatermark: true }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const quotaMsg = imgResponse.status === 429
        ? `Görsel modeli (${model}) için kota yok veya aşıldı. Ücretsiz Gemini anahtarlarında görsel üretim kotası 0 olabilir; Google AI Studio'da faturalandırmayı açın veya daha sonra tekrar deneyin.`
        : "Gemini görsel üretemedi. Sunucudaki model erişimini ve kotayı kontrol edin.";
      return new Response(JSON.stringify({ error: quotaMsg }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Geçersiz işlem." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Edge Function Server Error:", err);
    return new Response(
      JSON.stringify({ error: "Sunucu hatası oluştu." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
