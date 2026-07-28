# GameSkinAI — Güvenlik & Bug Test Raporu (Güncel)

> Tarih: 2026-07-27
> Kapsam: Statik kod incelemesi, build çıktısı denetimi, bağımlılık denetimi (penetrasyon/canlı trafik testi yapılmamıştır)
> Repo: `promtweb` (branch: `main`, son commit: `a0c0625`)
> Önceki rapor: `guvenlik_test_raporu.md` (2026-07-22)

Bu rapor, projeyinin **güncel** kaynak kodunu bağımsız olarak inceler. Önceki rapordaki bulgulardan **hangilerinin düzeltildiğini**, **hangi yeni bug'ların/ risklerin ortaya çıktığını** ve **hâlâ açık olan** konuları listeler. Her bulgu somut dosya/satır referansı, doğrulanmış kod parçası, etki ve önerilen çözüm içerir.

---

## 📊 Özet

| Kategori | Sayı | Durum |
|----------|------|-------|
| ✅ **Düzeltildi** | 7 | Eski raporda var, artık çözülmüş |
| 🔴 **Kritik (açık)** | 2 | RLS doğrulaması yok (repo seviyesinde) + client-side API anahtarı fallback path'i |
| 🟠 **Orta (açık)** | 5 | Edge Function auth token validate etmiyor, CORS `*`, IDOR update, client-side rate-limit, bağımlılık zafiyetleri |
| 🟡 **Düşük (açık)** | 5 | Public Storage bucket, hata mesajı sızıntısı, `Math.random` seed, silent catch, info leak |

**En acil iki konu:**
1. **Supabase `conversions` tablosu için Row Level Security (RLS) politiğının gerçekten etkin olduğu repo'dan doğrulanamıyor.** Şema dosyası/migrasyon repo'da yok (`supabase/` içinde `config.toml`, `migrations/` yok). Eğer Dashboard'da RLS kapalıysa → anon anahtar ile tüm kullanıcıların verisi okunabilir/IDOR yapılabilir.
2. **Edge Function `convert` token'ı yalnızca varlık olarak kontrol ediyor**, `supabase.auth.getUser(token)` ile doğrulamıyor → herhangi bir string `Authorization: Bearer xxx` başlığıyla çağrı geçer.

---

## ✅ DÜZELTİLEN BULGULAR (Eski rapora göre)

| # | Eski bulgu | Doğrulama |
|---|-----------|-----------|
| 1 | 🔴 Gemini API anahtarı client-side'a gömülü | **Çözüldü.** `.env`'de `REACT_APP_GEMINI_API_KEY=` boş bırakılmış; AI çağrıları `supabase/functions/convert/index.ts` Edge Function'ına taşınmış, anahtar `Deno.env.get("GEMINI_API_KEY")` ile server-side okunuyor. Build JS'lerinde `AIzaSy` anahtarı grep'te bulunamadı. |
| 4 | 🔴 Build'de anahtar packlenmiş | **Çözüldü.** Yukarıdaki nedenle buildotta anahtar yok. `.gitignore` `.env`yi kapsıyor ve `.env` git'e commit edilmemiş (`git ls-files` boş). |
| 5 | 🔴 Demo modu kimlik doğrulama bypass | **Kısmen çözüldü.** `AuthContext.js:37-47` artık demo user'ı yalnızca `NODE_ENV === 'development'` koşulunda atıyor; production'da `setUser(null)` → `ProtectedRoute` redirect çalışır. Risk büyük ölçüde azaltıldı. |
| 6 | 🔴 console.log ile anahtar/yanıt loglama | **Çözüldü.** `gemini.js`'deki duyarlı loglar artık `if (process.env.NODE_ENV === 'development')` koşuluna bağlı veya `console.warn`'e indirgenmiş. Anahtar ilk-10-hane logu kaldırılmış. |
| 11 | 🟠 Service worker önbellek bayatlaması | **Çözüldü.** `src/index.js` son satırı: `serviceWorkerRegistration.unregister()`. Açıklama yorumu da eklenmiş. Güvenlik yamaları artık anında kullanıcıya ulaşır. |
| 13 | 🟡 Email trim/normalize | **Çözüldü.** `SignIn.jsx:35` `email.trim().toLowerCase()` uyguluyor; `AuthContext` içinde de `signIn`/`signUp`/`resetPassword` normalize ediyor (satır 86, 114, 218). |
| 12 | 🟡 localStorage QuotaExceededError | **Çözüldü.** `useConversions.js:44-60` `safeSetLocalStorage` ile try/catch + budama (prune) mekanizması eklenmiş. |

**Not:** XSS yüzeyi hâlâ temiz — `dangerouslySetInnerHTML`, `eval`, `innerHTML`, `document.write` kaynak kodda **yok** (yalnızca minified `build/` çıktısında modele ait kod olarak çıkıyor, uygulama kodu değil).

---

## 🔴 KRİTİK (Açık) — Bulgu A1: RLS Politikası Repo'dan Doğrulanamıyor / Olası Veri Sızıntısı

**Dosya:** `src/lib/supabase.js:20-23` (yorumdaki SQL), `src/hooks/useConversions.js`
**Supabase dizini:** `supabase/` (sadece `functions/` ve `templates/` var — **`migrations/`, `config.toml`, şema yok**)

**Sorun:**
`supabase.js:20-23` yorumunda RLS politikası önerilmiş:
```sql
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own conversions"
  ON conversions FOR ALL USING (auth.uid() = user_id);
```
Ancak bu **sadece yorumdur** — repo'da migrasyon/şema dosyası yok. **Supabase Dashboard'da RLS'nin gerçekten açık olduğunu ve politikanın tanımlı olduğunu kod ile doğrulamak mümkün değil.**

İlgili istemci çağrıları:
- `useConversions.js:113-117` → `select('*').eq('user_id', user.id)` — fetch'te filtreli (RLS olsa da olmasa da kendi verisini çeker, iyi).
- `useConversions.js:149-153` → `delete().eq('id', id).eq('user_id', user.id)` — **`.eq('user_id')` eklenmiş, IDOR'a karşı savunma katmanı var.** ✅ (Eski Bulgu 2'deki delete IDOR çözülmüş.)
- `useConversions.js:233-238` → `update().eq('id', id)` — **`.eq('user_id', user.id)` yok.** RLS kapalıysa bir kullanıcı başka bir kullanıcının UUID'sini biliyor olsa `is_public`/`likes_count`/`status` alanlarını güncelleyebilir.
- `useConversions.js:284-288` → `fetchPublicConversions` `select('*').eq('is_public', true)` — **burada `select('*')` ile tüm kolonlar (orijinal fotoğraf URL'i dahil) herkese açık geliyor.** RLS yoksa zaten problem; RLS olsa bile `is_public=true` satırlarındaki `original_image_url` (kullanıcının selfie'i) kamuya açılır.

**Etki:** RLS kapalıysa → tüm kullanıcıların verisi anon anahtar ile okunabilir + IDOR (update). Public gallery, kullanıcı fotoğraflarını kamuya açabilir.

**Çözüm:**
1. **Supabase Dashboard → Authentication → Policies** bağlan ve şunları doğrula:
   - `conversions` tablosunda **RLS açık**.
   - `SELECT` için: `auth.uid() = user_id` (kullanıcı sadece kendi satırlarını görsün) **VE** `is_public = true` mantığı yalnızca `result_*` kolonlarını döndürecek şekilde (kişisel `original_image_url` hariç).
   - `INSERT/UPDATE/DELETE` için: `auth.uid() = user_id` hem `USING` hem `WITH CHECK` olarak.
2. `useConversions.js:233` update çağrısına **`.eq('user_id', user.id)`** ekle (delete ile paralel koruma).
3. `fetchPublicConversions`'da `select('*')` yerine **yalnızca public galeri için gereken kolonları** seç (`id`, `theme_slug`, `theme_label`, `result_image_url`, `result_description`, `created_at`, `likes_count`). `original_image_url`'i **dahil etme**.
4. Repo'ya `supabase/migrations/` ekleyip şema + RLS policy'leri versiyon kontrolüne al (tekrar doğrulanabilirlik için).

---

## 🟠 ORTA (Açık) — Bulgu A2: Edge Function Auth Token'ı Doğrulamıyor

**Dosya:** `supabase/functions/convert/index.ts:16-30`

**Sorun:**
```ts
const authHeader = req.headers.get("Authorization");
if (!authHeader) { return 401; }
const token = authHeader.replace("Bearer ", "").trim();
if (!token) { return 401; }
// ... token kullanılmadan işlem devam ediyor
```
Token'ın **yalnızca varlığı** kontrol ediliyor. `supabase.auth.getUser(token)` ile **geçerliliği doğrulanmıyor**. Yani herhangi bir rastgele string `Authorization: Bearer foo` başlığıyla gönderilirse Edge Function AI çağrısını yapar → Gemini API anahtarınız (server-side) kötüye kullanılır, faturanızdan çıkar.

İstemci tarafı `invokeEdgeFunction` (`supabase.js:202-216`) `supabase.functions.invoke` kullandığı için gerçek kullanıcı token'ını otomatik ekler — normal kullanıcılar bu yolu kullanır. Ama endpoint doğrudan (örn. `curl`) çağrılabilir; token doğrulaması olmadığı için herhangi biri çağırabilir.

**Etki:** Yetkisiz AI kullanımı → API kota/fatura kötüye kullanımı. Rate-limit de sunucuda olmadığından (A4) sınırsız çağrı mümkün.

**Çözüm:** Token'ı doğrula:
```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
// client'ı service-role SUPABASE_SERVICE_ROLE_KEY ile DEĞİL, kullanıcının token'ı ile oluştur
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
  { global: { headers: { Authorization: authHeader } } }
);
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  return new Response(JSON.stringify({ error: "Yetkisiz." }), { status: 401, ... });
}
// artık user.id kullanılabilir; rate-limit user.id'ye göre uygulanabilir
```

---

## 🟠 ORTA (Açık) — Bulgu A3: Edge Function CORS `*` (Tüm Originler)

**Dosya:** `supabase/functions/convert/index.ts:4-7`

**Sorun:**
```ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  ...
};
```
`Allow-Origin: *`, tarayıcı tabanlı token'lı çağrılarda sorun yaratmaz (token header gerekli), ama **herhangi bir siteden bu endpoint'e script çağrısına izin verir**. A2 çözülüp token doğrulama gelse bile, en iyi pratik **allowlist ile kısıtlamaktır**.

**Etki:** Orta — diğer alanlardan istek yapılabilir; A2 ile birleşince yetkisiz kullanım.

**Çözüm:** `Allow-Origin`'i `https://gameskin.batutnk.com.tr` (ve `http://localhost:3000` dev için) olarak kısıtla; `Vary: Origin` ekle.

---

## 🟠 ORTA (Açık) — Bulgu A4: Rate Limiting İstemci Taraflı (Atlatılabilir)

**Dosya:** `src/views/admin/converter/index.jsx:79, 186-198`

**Sorun:**
```js
const lastRequestTime = useRef(0);
if (timeSinceLastRequest < RATE_LIMIT_SECONDS && lastRequestTime.current !== 0) { return; }
```
Rate limit `useRef`'te, sayfa yenilemeyle sıfırlanır. Edge Function'da sunucu-taraflı limit yok. A2 ile birleşince: yetkisiz kullanıcı endpoint'i direkt çağırıp sınırsız AI isteği yapabilir.

**Etki:** Maliyet/fatura saldırısı.

**Çözüm:** Edge Function'da `user.id` başına zaman penceresi limiti uygula (örn. son 30 sn içinde aynı kullanıcıdan çağrı varsa 429). Supabase auth veya bir `rate_limits` tablosu/edgestore kullanılabilir.

---

## 🟠 ORTA (Açık) — Bulgu A5: 61 Bağımlılık Zafiyeti (npm audit)

**Sonuç:** `npm audit --omit=dev` → **61 vulnerabilities (13 low, 15 moderate, 30 high, 3 critical)**

- Kritik: `websocket-driver` (GHSA-mp7j-qc5w-4988, GHSA-xv26-6w52-cph6)
- Yüksek: `ws` (DoS / uninitialized memory disclosure)
- Orta: `yaml` (nested collection stack overflow)

**Sorun:** Zafiyetlerin büyük çoğunluğu `react-scripts@5.0.1` (CRA) devDependencies zincirinden (webpack-dev-server/ws) geliyor; **canlı build'i değil yalnızca dev sunucusunu** etkiler. Yine de `react-scripts` **bakımsız/deprecated**. Proje Vite'a kısmen geçmiş (`vite.config.js`, `npm run dev` Vite kullanıyor) ama `react-scripts` hâlâ `package.json`'da — çift toolchain karmaşası.

**Çözüm:**
1. `npm audit fix` çalıştır (non-breaking).
2. `react-scripts` ve CRA betiklerini tamamen kaldır, Vite'a tam göç (build/dev/preview tek toolchain). Bu, dev-server zafiyetlerinin çoğunu ortadan kaldırır.
3. Eski `apexcharts 3.35.5` / `react-apexcharts 1.4.0` — kullanılmıyorsa kaldır.

---

## 🟠 ORTA (Açık) — Bulgu A6: Dosya Yükleme Validasyonu İstemci Taraflı

**Dosya:** `src/components/converter/ImageUploader.jsx:75-81` (react-dropzone), `src/lib/supabase.js:109-117`

**Sorun:**
- `react-dropzone` `accept`/`maxSize` sadece **istemci kontrolüdür**; `file.type` (MIME) browser bildirimine dayanır, **spoof edilebilir**.
- `supabase.js:109` → `file.name.split('.').pop()` ile uzantı alınır; server/Storage tarafında gerçek MIME/magic-byte doğrulaması yok.
- Upload Storage'a **public bucket**'a gidiyor (`getPublicUrl`, satır 128-130) — A7 ile birleşince kullanıcı selfie'leri URL bilen herkese açık.

**Çözüm:**
1. Storage bucket `conversions`'ı **private** yap; görsel erişimi **Signed URL** ile sınırla (`createSignedUrl`).
2. Yüklemeden önce client'ta gerçek MIME'i `file.type` + magic byte kontrolü ile teyit et; geçmezse reddet.
3. Uzantıyı orijinal `file.name`'den değil, tanımlı bir setten (jpg/png/webp) rastgele UUID + uzantı olarak ata.

---

## 🟡 DÜŞÜK (Açık) — Bulgu A7: Public Storage Bucket → Kullanıcı Fotoğrafları Kamusal

**Dosya:** `src/lib/supabase.js:128-132`

```js
const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);
return publicUrl;
```

**Sorun:** `conversions` bucket'ı public ise, yüklenen kullanıcı fotoğrafları (selfie) URL bilen herkes tarafından görülebilir. Public URL tahmin edilebilir olmasa da (UUID var, `Math.random` DEĞİL — `crypto.randomUUID` kullanılıyor satır 110, iyi) link bir kez paylaşıldığında/sızdığında kapatılamaz.

**Çözüm:** Bucket'ı private yap, `createSignedUrl` ile süreli erişim ver. A6 ile birlikte çözülür.

**Not (olumlu):** `supabase.js:110` artık `crypto.randomUUID()` kullanıyor — dosya adı çakışması/tahmin riski büyük ölçüde giderildi. (Eski Bulgu 17 dosya-adı kısmı çözüldü.)

---

## 🟡 DÜŞÜK (Açık) — Bulgu A8: Hata Mesajlarında Bilgi Sızıntısı

**Dosya:** `supabase/functions/convert/index.ts:73, 137`, `src/lib/gemini.js:158, 444, 551`

```ts
// edge function
JSON.stringify({ error: errData?.error?.message || "AI servisi hata döndürdü." })
// catch
JSON.stringify({ error: err.message || "Sunucu hatası." })
```

**Sorun:** Ham Gemini/AI hatası (`errData?.error?.message`) doğrudan istemciye döndürülüyor. Bu, iç API mesajlarını/hata kodlarını sızdırabilir. `gemini.js` istemci tarafında da benzer ham mesajlar `console.warn`'e gidiyor (production'da console erişilebilir).

**Çözüm:** Edge Function'da Gemini hatasını generic mesaja map'le; gerçek hatayı yalnızca server log'una yaz. İstemciye `"AI servisi geçici olarak kullanılamıyor."` gibi nötr mesaj döndür.

---

## 🟡 DÜŞÜK (Açık) — Bulgu A9: `Math.random()` Seed — Görsel Farklılığı İçin Tahmin Edilebilir

**Dosya:** `src/lib/gemini.js:396, 456`, `supabase/functions/convert/index.ts:116`

```js
const seed = Math.floor(Math.random() * 1000000);
```

**Sorun:** Pollinations fallack görsel üretiminde `Math.random()` seed kullanılıyor. Güvenlik açısından kritik değil (görsel tahmini değil), ama **deterministik/tahmin edilebilir** — önbellek çakışması ve aynı görselin tekrarlanması riski. `crypto.randomUUID` pattern'ı zaten repo'da kullanıldığından tutarlılık için.

**Çözüm:** `crypto.getRandomValues(new Uint32Array(1))[0]` ile kriptografik olarak rastgele seed üret.

---

## 🟡 DÜŞÜK (Açık) — Bulgu A10: Silent `catch {}` / Hata Yutma

**Dosya:** `src/hooks/useConversions.js:15-20, 47-58` (`catch (e) {}` — argümansız değil ama return ediyor), `src/lib/supabase.js:54` (`catch {}`)

```js
function isValidSupabaseUrl(url) {
  try { ... } catch { return false; }   // supabase.js:54
}
```

**Sorun:** Bazı `catch` blokları hatayı yutar/loglamaz → debugging zorlaşır. `supabase.js:54` URL parse hatasını sessizce `false`'a indiriyor (burada kabul edilebilir, ama birkaç yerde `catch (e) { /* hiçbir şey */ }` var).

**Çözüm:** En azından `console.warn('...', e);` ile debug seviyesinde logla. Üretim log utility'si (`NODE_ENV !== 'production'`) ile kısıtla.

---

## 📌 Ek Notlar (Bulgu Dışı — Olumlu ve Gözlem)

- ✅ `.env` git'e commit edilmemiş; `.gitignore` doğru; build çıktısında API anahtarı yok.
- ✅ `dangerouslySetInnerHTML`/`eval`/`innerHTML` kaynak kodda yok — klasik XSS yüzeyi temiz.
- ✅ Service worker `unregister()` → güvenlik yamaları anında ulaşır.
- ✅ `crypto.randomUUID()` dosya adlarında — tahmin/çakışma riski düşük.
- ✅ `AbortController` + timeout (`gemini.js:142`) — iyi pratik.
- ✅ Prompt injection'a karşı basit sanitizasyon var (`converter/index.jsx:303-309`; `ignore previous`, `system:`, özel karakterler budanıyor).
- ✅ JSON repair parser (`converter/index.jsx:244-264`) `for` ile tek geçiş yapıyor — sonsuz döngü/DoS riski yok.
- ✅ Email normalize (`trim().toLowerCase`) hem SignIn hem AuthContext'te tutarlı.
- ✅ `localStorage` yazımı `safeSetLocalStorage` ile quota-yönetimli.
- ⚠️ **Gözlem:** `useConversions.js:204-207` Supabase'e insert sonrası **aynı veriyi localStorage'a da yazıyor** (`[data, ...list]`). Bu, kullanıcı demo/çevrimdışı fallback için olsa da, gerçek Supabase modunda gereksiz duplicate + localStorage şişmesi. Build küçük tutmak için kaldırılabilir.
- ⚠️ **Gözlem:** `gemini.js`'de **client-side doğrudan Gemini fallback path'i hâlâ kodda** (satır 104-115, 392-409, 494) — `REACT_APP_GEMINI_API_KEY` boş olduğu için şu an pasif. Ama bir kişi `.env`'e anahtar yazıp build alırsa tekrar sızar. Bu path'i tamamen kaldırmak (Edge Function失败sa Pollinations'a düşsün) en kalıcı çözüm.

---

## 🚨 Öncelikli Düzeltme Sırası (Action Plan)

1. **[ACİL — Dashboard]** Supabase Dashboard'da `conversions` tablosu için **RLS'nin açık olduğunu** ve `auth.uid() = user_id` politikalarının (SELECT/INSERT/UPDATE/DELETE) tanımlı olduğunu doğrula. RLS kapalıysa **hemen aç**.
2. **[ACİL — Kod]** Edge Function `convert/index.ts`'de token'ı `supabase.auth.getUser(token)` ile **doğrula** (A2); geçersizse 401. Bu aynı zamanda A4 için user.id'yi rate-limit anahtarı yapar.
3. **[Önemli]** `useConversions.js:233` update'e `.eq('user_id', user.id)` ekle; `fetchPublicConversions` `select('*')` yerine public-safe kolonları seç (`original_image_url` hariç) (A1).
4. **[Önemli]** Storage bucket `conversions`'ı **private** yap → Signed URL erişimi (A6, A7).
5. **[Önemli]** Edge Function CORS `*` → allowlist (`gameskin.batutnk.com.tr` + localhost) (A3).
6. **[Önemli]** Edge Function'a sunucu-taraflı rate-limit (user.id başına) ekle (A4).
7. **[Önemli]** `npm audit fix`; `react-scripts`/CRA'yı kaldır, Vite tek toolchain (A5).
8. **[Düşük]** Ham hata mesajlarını generic map'le (A8); `Math.random` seed → `crypto.getRandomValues` (A9); silent catch'lere log ekle (A10).
9. **[Düşük]** `gemini.js`'deki client-side Gemini fallback path'ini tamamen kaldır (sadece Pollinations'a düşsün) → kalıcı anahtar-sızıntı riskini sıfırla.
10. **[Düşük]** Repo'ya `supabase/migrations/` ekleyerek şema + RLS'i versiyon kontrolüne al → doğrulanabilirlik.

---

## 🔬 Test Yöntemi ve Sınırlar

- **Yapılan:** Kaynak kodu manuel okuma (`src/`, `supabase/`), `.env`/`.gitignore`/git-track doğrulaması, build JS'lerinde anahtar grep, `npm audit`, `dangerouslySetInnerHTML`/`eval`/`innerHTML` grep.
- **Yapılmayan:** Canlı ağ trafiği izleme, gerçek RLS davranış testi (anon anahtar ile raw Supabase REST çağrısı), penetrasyon, OAuth redirect allowlist doğrulaması, Storage bucket public/private ayar doğrulaması (Dashboard seviyesi).
- **Önerilen takip:** A1 ve A2'yi doğrulamak için Supabase Dashboard + bir anon anahtar ile `curl` testi (raw REST/Edge Function çağrısı) yap. Bu rapordaki en kritiki iki nokta Dashboard/Sunucu konfigürasyon seviyesinde olup yalnızca kod okuyarak kesin doğrulanamaz.

*Son paralel denetim denemesi (iki alt-ajan) API rate-limit (429) nedeniyle erken sonlandı; tüm bulgular bu oturumda manuel kod incelemesiyle doğrulanmıştır.*
