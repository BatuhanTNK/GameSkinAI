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

// In-memory sliding window rate limiting per user ID or IP (max 5 requests per 60 seconds)
const userRequestHistory = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

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
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Yetkisiz erişim. Token bulunamadı." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Geçersiz token formatı." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate user JWT or valid Anon Key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase URL or Anon Key missing in Edge Function environment.");
      return new Response(
        JSON.stringify({ error: "Sunucu konfigürasyon hatası." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: authUser } } = await supabase.auth.getUser();
    const isValidAnon = token === supabaseAnonKey;

    if (!authUser && !isValidAnon) {
      console.warn("Auth verification failed for token.");
      return new Response(
        JSON.stringify({ error: "Geçersiz veya yetkisiz oturum token'ı." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rateLimitKey = authUser?.id || req.headers.get("x-forwarded-for") || "anon-client";

    // Rate Limiting Check (Bulgu A4)
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyip tekrar deneyin." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, imageBase64, mimeType, themePrompt, isJson, responseSchema, prompt } = body;

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Sunucu tarafında Gemini API anahtarı yapılandırılmamış." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "analyze") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
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

      const aiResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!aiResponse.ok) {
        const errData = await aiResponse.json().catch(() => ({}));
        console.error("Gemini Analyze Error:", errData);
        return new Response(
          JSON.stringify({ error: "AI servisi yanıt veremedi. Lütfen tekrar deneyiniz." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await aiResponse.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        return new Response(
          JSON.stringify({ error: "AI yanıt üretemedi." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ description: textContent }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "generateImage") {
      // Imagen 4.0 or Fallback
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      const requestBody = {
        instances: [{ prompt }],
        parameters: { aspectRatio: "1:1", numberOfImages: 1, outputMimeType: "image/jpeg" },
      };

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

      // Fallback Pollinations with Cryptographically Secure Random Seed (Bulgu A9)
      const randomBuffer = new Uint32Array(1);
      crypto.getRandomValues(randomBuffer);
      const seed = randomBuffer[0] % 1000000;

      const pollinationUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${seed}`;
      const polResp = await fetch(pollinationUrl);
      if (!polResp.ok) {
        throw new Error("Ücretsiz görsel servisi yanıt vermedi.");
      }
      const arrayBuffer = await polResp.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      return new Response(
        JSON.stringify({ imageBase64: base64 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
