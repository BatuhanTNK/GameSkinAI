# GameSkinAI — Yeni Özellik Önerileri

Bu doküman, projenin detaylı incelemesi sonucunda çıkarılan yeni özellik önerilerini içerir.
Öneriler etki/zorluk dengesine göre üç gruba ayrılmıştır.

## Mevcut Durum Özeti

Proje şu an sağlam bir temele sahip:

- ✅ 18+ oyun teması (Minecraft, Roblox, Fortnite, Valorant, Cyberpunk vb.)
- ✅ Gemini tabanlı AI dönüşüm (Supabase Edge Function üzerinden güvenli)
- ✅ Supabase entegrasyonu (Auth + Storage + Edge Function + RLS)
- ✅ TR/EN çoklu dil desteği (URL prefix tabanlı)
- ✅ Topluluk galerisi + beğeni sistemi
- ✅ Geçmiş yönetimi (arama, filtre, public/private toggle)
- ✅ Güvenlik katmanları (magic byte doğrulama, rate limit, prompt sanitization)
- ✅ Google & Discord OAuth
- ✅ Fallback mekanizmaları (Supabase yoksa localStorage, Gemini yoksa demo üretici)

---

## 🎯 Hızlı Kazanımlar (1-2 gün, yüksek etki)

### 1. Kredi/Kota Sistemi ⭐ (İlk önerilen)
- **Sorun:** Landing SSS'de *"ücretsiz deneme kredileri"* vaadediliyor ama sistemde kredi yok!
- **Çözüm:** Günlük 5 ücretsiz dönüşüm gibi bir kota + profilde kalan kredi göstergesi.
- **Bonus:** Monetizasyonun ilk adımı olur.

### 2. Gerçek Başarım (Achievement) Sistemi
- **Sorun:** Profildeki rozetler şu an sadece görsel, gerçek metriklere bağlı değil.
- **Çözüm:** "İlk dönüşüm", "5 farklı tema dene", "10 beğeni topla" gibi gerçek metriklere bağlama.
- **Not:** Mevcut `conversions` verisi yeterli, ek tablo gerekmez.

### 3. Sonucu Yeniden Üret (Regenerate / Varyasyon)
- Aynı fotoğraf + tema ile farklı seed'lerle 2-4 varyasyon üretip kullanıcıya seçtirme.
- **Not:** Pollinations seed tabanlı olduğu için implementasyonu çok kolay.

### 4. Paylaşılabilir Public Link ⭐
- `/tr/skin/:id` gibi giriş gerektirmeyen bir detay sayfası.
- Open Graph meta etiketleri → sosyal medyada paylaşınca görsel önizleme çıkar.
- **Bonus:** Organik büyüme sağlar.

### 5. Galeri Sıralama/Filtreleme Geliştirmesi
- Topluluk galerisine "En Beğenilenler", "Bu Hafta Trend", tema bazlı filtre sekmeleri.

---

## 🚀 Orta Vadeli Özellikler (3-7 gün)

### 6. Gerçek Dashboard ⭐
- **Sorun:** `views/admin/default` hâlâ Horizon UI'ın placeholder verisiyle duruyor (kazanç/satış grafikleri).
- **Çözüm:** Kullanıcının kendi istatistikleri:
  - Toplam dönüşüm sayısı
  - Tema dağılımı (PieChart)
  - Haftalık aktivite (LineChart)
- **Not:** Chart bileşenleri (`ApexCharts`) zaten projede mevcut.

### 7. Kullanıcı Profilleri & Takip Sistemi
- Galerideki skinlere tıklayınca üreticinin public profili.
- Takip et / takipçi sistemi, kullanıcının public skinleri.
- **Gereksinim:** `profiles` tablosu + RLS politikaları.

### 8. Yorum Sistemi
- Public skinlere yorum yapabilme (beğeninin doğal devamı).
- **Gereksinim:** `comments` tablosu + RLS + moderasyon düşünülmeli.

### 9. AI Stil Ayarları
- Dönüşüm öncesi ek seçenekler:
  - Poz: "kahraman pozu / portre"
  - Ton: "epik / sevimli"
  - Renk paleti tercihi
- Tema prompt'una eklenen birkaç parametre ile büyük UX kazancı.

### 10. Prompt Kütüphanesi / Kopyalama
- **Sorun:** Landing'de "Promptu Kopyala" vaadi var ama uygulama içinde tam karşılığı yok.
- **Çözüm:** Üretilen prompt'ları Midjourney/Stable Diffusion formatında kopyalanabilir hale getirme + hazır prompt şablonları sayfası.

### 11. Minecraft Skin PNG Export ⭐ (Killer feature)
- `MinecraftSkinPreview` canvas'ı zaten skin datası çiziyor.
- Bunu gerçek **64x64 Minecraft skin dosyası** olarak indirilebilir yapmak.
- **Değer:** Oyuncular skini doğrudan oyunda kullanabilir!

---

## 💎 Büyük Özellikler (1-2 hafta+)

### 12. Ödeme/Abonelik Sistemi (Stripe veya İyzico)
- Kredi sistemi üzerine kurulur:
  - **Free:** 5 dönüşüm/gün
  - **Pro:** Sınırsız + HD çıktı + öncelikli kuyruk
- Supabase Edge Function ile webhook entegrasyonu.

### 13. Admin Paneli
- **Sorun:** `themes` tablosu DB'de var ama yönetim arayüzü yok.
- **Özellikler:**
  - Tema ekleme/düzenleme/pasifleştirme
  - Kullanıcı istatistikleri
  - Uygunsuz içerik moderasyonu (public skinleri gizleme)

### 14. Haftalık Yarışma / Challenge
- "Bu haftanın teması: Cyberpunk" → en çok beğeni alan kazanır.
- Ödül: özel rozet + galeri öne çıkarma.
- **Değer:** Topluluk etkileşimini ciddi artırır.

### 15. Gerçek PWA + Push Bildirim
- **Sorun:** `serviceWorkerRegistration.js` var ama offline cache stratejisi ve bildirim yok.
- **Bildirimler:** "Dönüşümün hazır", "Skinin 10 beğeni aldı" vb.

### 16. Batch Dönüşüm
- Tek fotoğrafı seçili birden çok temaya aynı anda dönüştürme.
- Karşılaştırmalı grid sonuç ekranı.
- **Bonus:** Pro özelliği olarak satılabilir.

---

## 🔧 Teknik İyileştirme Notları

| # | Konu | Detay |
|---|------|-------|
| 1 | History detay modalı | `eksiklikler.md`'de yarım olarak işaretli ama `HistoryDetailModal.jsx` artık mevcut — durum netleştirilmeli. |
| 2 | Discord OAuth bug | Redirect'i dil prefix'siz (`/admin/converter`) — Google'daki gibi `/${lang}/admin/converter` olmalı. |
| 3 | Bundle temizliği | Kullanılmayan Horizon sayfaları (`tables`, `rtl`, `nfts` görselleri) temizlenirse bundle küçülür. |

---

## 📌 Önerilen Başlangıç Sırası

En yüksek değer/efor oranına göre:

1. **Kredi sistemi** (#1) — Landing vaadi karşılanır + monetizasyon temeli
2. **Gerçek Dashboard** (#6) — Placeholder veri kalkar, uygulama profesyonelleşir
3. **Minecraft PNG Export** (#11) — Oyuncular için gerçek kullanım değeri
4. **Paylaşılabilir link** (#4) — Organik büyüme kanalı
