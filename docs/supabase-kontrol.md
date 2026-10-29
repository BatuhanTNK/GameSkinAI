# Supabase kontrolü — 27 Ekim 2026

Yerel `.env`, `jzmofxpbssqprgiggxcz.supabase.co` adresini kullanıyor. Anon JWT içindeki proje referansı aynı; anahtarın süresi dolmamış. Bu kontrol anahtar imzasını doğrulamaz.

İlk Google ve Cloudflare DNS-over-HTTPS sorguları bu adres için ayrı ayrı `Status: 3` (NXDOMAIN) döndürdü. Sonraki kontrolde DNS düzelmişti; kısa süreli HTTP 521 yanıtlarından sonra Auth ve veritabanı HTTP 200 döndürmeye başladı. Kesintinin kesin nedeni panelden doğrulanamadı. Kullanıcının paylaştığı organizasyon adresi: https://supabase.com/dashboard/org/frqwnqmchegydujoeogd

Son canlı kontrolde Auth health, themes, conversions (`id,user_display_name,prompt`) ve profiles (`id`) sorguları HTTP 200 döndürdü. Bu, endpoint ve sorgulanan kolonların erişilebilir olduğunu gösterir; kullanıcı oturumuyla INSERT/UPDATE RLS doğrulaması değildir. `convert` fonksiyonuna kullanıcı oturumu olmadan, yalnızca anon key ile gönderilen `healthcheck` işlemi HTTP 400 ve `Geçersiz işlem.` döndürdü. Dolayısıyla fonksiyon yayında, fakat oturumsuz isteği uygulama içine kabul ediyor; yerelde düzeltilen 401 davranışı henüz uzakta yayınlı değil.

## Bağlantıyı yeniden kurma

1. Organizasyon içindeki GameSkinAI projesini açın. Paused durumundaysa Resume project seçeneğini kullanın.
2. Projenin Connect/API bölümünden Project URL ve aynı projeye ait publishable/anon key alın. `.env` içindeki `REACT_APP_SUPABASE_URL` ve `REACT_APP_SUPABASE_ANON_KEY` değerlerini güncelleyin. Secret/service_role key tarayıcıya eklenmemeli.
3. `npm run check:supabase` çalıştırın. DNS, Auth ve mevcut tablo şemalarını kontrol eder; anahtarı yazdırmaz, veri oluşturmaz, Gemini üretimi başlatmaz.
4. Eksik migration varsa Supabase CLI ile doğru projeye bağlanıp migration geçmişini kontrol edin; ardından `supabase db push` uygulayın. Yeni Storage migration'ı conversions bucket ve kullanıcıya ait görseller için INSERT/SELECT politikalarını oluşturur. Uzak projeye bu incelemede migration uygulanmadı.
5. Edge Function secrets içinde `GEMINI_API_KEY` tanımlı olmalı. İsteğe bağlı `GEMINI_ANALYSIS_MODEL` (varsayılan `gemini-2.5-flash`) ve `GEMINI_IMAGE_MODEL` (varsayılan `gemini-2.5-flash-image`) kullanılabilir. Ardından `supabase functions deploy convert` ile yerel düzeltmeleri yayınlayın. Bu incelemede uzak fonksiyon yayınlanmadı.
6. Geliştirme sunucusunu yeniden başlatın. Gerçek kullanıcıyla giriş yapıp bir dönüşüm, Storage yüklemesi ve sayfa yenilemesinden sonra geçmiş kaydını kontrol edin.
7. GitHub Pages kullanılıyorsa repository secrets içindeki iki Supabase değeri de aynı projeye ait olmalı; yeniden build/deploy gerekir.

## Yerel düzeltmeler

- Supabase yapılandırılmışken oturumsuz kullanıcıya sahte demo hesabı atanmıyor; çıkış olayı kullanıcı state'ini temizliyor.
- Analiz, görsel üretimi, Storage ve veritabanı hataları başarı gibi gösterilmiyor.
- Edge Function eksik Gemini anahtarı için 503, gerçek üretim hatası için 502 döndürüyor; sabit karakter cevabı ve üçüncü taraf görsel fallback'i kaldırıldı.
- Token uzunluğu kimlik doğrulama sayılmıyor; Supabase Auth tarafından doğrulanan kullanıcı gerekiyor.
- Eski Imagen predict çağrısı Gemini generateContent görsel üretimiyle değiştirildi. Yanıttaki gerçek MIME türü korunuyor; varyasyonlar doğrudan gösterilebilen data URL alıyor.
- Vite istemciye yalnızca gerekli iki Supabase değişkenini aktarıyor; `.env` içindeki tüm değişkenleri paketlemiyor.

## Sınırlar

Panel erişimi sağlanamadığı ve gerçek kullanıcı oturumu kullanılmadığı için uzaktaki migration geçmişi, bucket/policy, Gemini secret, kullanıcı girişi ve gerçek üretim doğrulanamadı. Signed URL'ler mevcut tasarımda 7 gün sonra sona eriyor; geçmiş ve public galeri için kalıcı nesne yolu saklayıp erişim sırasında yeni URL üretme işi ayrıca ele alınmalı. Günlük kota halen istemcide sayılıyor; sunucuda kalıcı kota uygulaması bu incelemenin kapsamında değil.

Yerel doğrulama: Vite üretim derlemesi başarılı; 7 Edge Function testi ve 13 istemci/oturum/kayıt testi geçti. Edge Function testleri Node VM içinde Deno/HTTP bağımlılıkları taklit edilerek çalıştırılır; gerçek Deno dağıtımı veya Gemini üretiminin yerine geçmez.

Kaynaklar: [Supabase NXDOMAIN](https://supabase.com/kb/troubleshooting/nxdomain-error-connecting-to-a-supabase-project), [Storage RLS](https://supabase.com/docs/guides/storage/security/access-control), [Gemini görsel üretimi](https://ai.google.dev/gemini-api/docs/generate-content/image-generation).
