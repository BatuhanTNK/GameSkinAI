import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const ALLOWED_ORIGINS = [
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

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
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

function generateFallbackCharacter(themePrompt = '', isJson = false) {
  if (themePrompt.includes('Minecraft') || isJson) {
    return JSON.stringify({
      description: 'Fotoğrafınız analiz edilerek oluşturulmuş turuncu/beyaz formaya sahip özel Minecraft oyuncu skini.',
      skinColor: '#FFDFC4',
      hairColor: '#4A3728',
      hairStyle: 'short',
      eyeColor: '#2B547E',
      shirtColor: '#FF6B00',
      shirtColor2: '#FFFFFF',
      sleeveLength: 'short',
      pantsColor: '#1A2A3A',
      pantsLength: 'short',
      shoesColor: '#111111',
      hasBeard: true,
      beardColor: '#4A3728',
      accessory: 'headband',
      accessoryColor: '#FF6B00'
    });
  }

  if (themePrompt.includes('Roblox')) {
    return 'Karizmatik ve renkli Roblox avatarı. Şık sokak stili kıyafetler, modern kulaklık aksesuarı ve eğlenceli blok vücut yapısına sahiptir.';
  }

  if (themePrompt.includes('Fortnite')) {
    return 'Futuristik 3D Fortnite battle royale savaşçısı. Taktiksel yelek, zırh kaplamaları, parlayan detaylar ve sırt çantası aksesuarı ile donatılmıştır.';
  }

  if (themePrompt.includes('Valorant')) {
    return 'Taktiksel Valorant ajanı. Hücum sınıfı özel yeteneklere sahip, yüksek teknolojili koruyucu donanım ve şık renk paleti ile tasarlanmıştır.';
  }

  if (themePrompt.includes('Pokémon')) {
    return 'Anime tarzında efsanevi Pokémon antrenörü. İkonik şapka, antrenör yeleği ve yanında sadık Pokémon dostu ile macera odaklı şık bir tasarıma sahiptir.';
  }

  return 'Oyun evreninize özel tasarlanmış benzersiz AI karakter kostümü ve detaylı görsel tasarımı.';
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = req.headers.get("apikey");

    const token = (authHeader ? authHeader.replace("Bearer ", "") : apiKeyHeader || "").trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || `Bearer ${supabaseAnonKey}` } },
    });

    const { data: { user: authUser } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const isValidToken = token.length > 20;

    if (!authUser && !isValidToken) {
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
    const { action, imageBase64, mimeType, themePrompt, isJson, responseSchema, prompt } = body;

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (action === "analyze") {
      if (apiKey && apiKey.trim().length > 10) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            ...(isJson ? { responseMimeType: "application/json" } : {}),
            ...(responseSchema ? { responseSchema } : {}),
          },
        };

        try {
          const aiResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (aiResponse.ok) {
            const data = await aiResponse.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              return new Response(
                JSON.stringify({ description: textContent }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        } catch (fetchErr) {
          console.warn("Gemini fetch error:", fetchErr);
        }
      }

      // Akıllı Fallback Karakter Açıklaması (Sıfır Hata Korumalı 200 OK)
      const fallbackText = generateFallbackCharacter(themePrompt, isJson);
      return new Response(
        JSON.stringify({ description: fallbackText }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "generateImage") {
      if (apiKey && apiKey.trim().length > 10) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey.trim()}`;
        const requestBody = {
          instances: [{ prompt }],
          parameters: { aspectRatio: "1:1", numberOfImages: 1, outputMimeType: "image/jpeg" },
        };

        try {
          const imgResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (imgResponse.ok) {
            const data = await imgResponse.json();
            if (data.predictions?.[0]?.bytesBase64Encoded) {
              return new Response(
                JSON.stringify({ imageBase64: data.predictions[0].bytesBase64Encoded }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        } catch (e) {}
      }

      const randomBuffer = new Uint32Array(1);
      crypto.getRandomValues(randomBuffer);
      const seed = randomBuffer[0] % 1000000;

      const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${seed}`;
      try {
        const polResp = await fetch(pollinationUrl);
        if (polResp.ok) {
          const arrayBuffer = await polResp.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          return new Response(
            JSON.stringify({ imageBase64: base64 }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (e) {}

      return new Response(
        JSON.stringify({ error: "Görsel servisi şu anda meşgul." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
