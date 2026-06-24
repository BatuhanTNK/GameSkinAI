# Game Skin Converter — Claude Kod Geliştirme Prompt'u

---

## BAĞLAM VE ŞABLON BİLGİSİ

Sen bir React uygulaması geliştiriyorsun. Temel şablon olarak **Horizon UI Chakra** kullanılıyor.

Şablonun teknik yapısı:
- **React 19** + **React Router DOM v6**
- **Chakra UI v2.6.1** — tüm UI bileşenleri için (Box, Flex, Button, Input, Text, Card, useColorModeValue vb.)
- **@emotion/react + @emotion/styled** — styling
- **Framer Motion** — animasyonlar
- **react-dropzone** — dosya yükleme
- **react-icons** — ikonlar
- **ApexCharts / react-apexcharts** — grafikler (ihtiyaç olursa)
- **@tanstack/react-table** — tablolar (ihtiyaç olursa)
- Routing: `src/index.js` → `<App />` → `src/App.js` içinde route tanımları
- Layout: `src/layouts/` klasöründe `admin/` ve `auth/` layout'ları mevcut
- Sayfalar: `src/views/` altında organize edilmiş
- Tema: `src/theme/` altında Chakra UI özelleştirmeleri
- Renk modu: `useColorModeValue` hook ile dark/light mode destekli

**ÖNEMLİ:** Tüm bileşenleri Chakra UI ile yaz. Tailwind CSS kullanma. Inline style kullanımını minimize et, Chakra UI prop sistemi kullan (`bg`, `p`, `borderRadius`, `color` vb.).

---

## PROJE TANIMI

**Uygulama adı:** GameSkinAI  
**Amaç:** Kullanıcıların kendi fotoğraflarını yükleyip, hazır AI prompt şablonları aracılığıyla farklı oyun tarzlarında karakter görsellerine dönüştürebildiği bir web uygulaması.

**Temel akış:**
1. Kullanıcı kayıt/giriş yapar
2. Dashboard'dan bir tema seçer (Minecraft, Roblox, Among Us vb.)
3. Fotoğrafını yükler
4. AI (Google Gemini API) fotoğrafı analiz edip tema prompt'uyla birleştirir
5. Dönüştürülmüş karakter açıklaması + görsel üretilir
6. Sonuç gösterilir, geçmişe kaydedilir, indirilebilir

---

## VERİTABANI VE KİMLİK DOĞRULAMA

**Supabase** kullan. Tüm Supabase işlemleri için `src/lib/supabase.js` dosyası oluştur:

```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Gerekli Supabase tabloları** (SQL olarak da yaz, yorum satırı olarak dosyanın başına ekle):

```sql
-- conversions tablosu
CREATE TABLE conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_slug TEXT NOT NULL,
  theme_label TEXT NOT NULL,
  original_image_url TEXT,
  result_image_url TEXT,
  result_description TEXT,
  status TEXT DEFAULT 'pending', -- pending | processing | done | error
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own conversions"
  ON conversions FOR ALL USING (auth.uid() = user_id);

-- themes tablosu
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  icon TEXT,
  active BOOLEAN DEFAULT true
);
```

**package.json'a eklenecek paketler:**
```
@supabase/supabase-js
```

**.env dosyasına eklenecekler:**
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

---

## DOSYA YAPISI

Aşağıdaki dosyaları oluştur veya mevcut şablon dosyalarını düzenle:

```
src/
├── lib/
│   ├── supabase.js          ← Supabase client
│   └── gemini.js            ← Gemini API servis fonksiyonları
├── contexts/
│   └── AuthContext.js       ← Kullanıcı auth state yönetimi
├── hooks/
│   └── useConversions.js    ← Dönüşüm geçmişi hook'u
├── views/
│   ├── auth/
│   │   ├── signIn/
│   │   │   └── index.jsx    ← Giriş sayfası (şablondaki mevcut sayfa düzenlenir)
│   │   └── signUp/
│   │       └── index.jsx    ← Kayıt sayfası
│   └── admin/
│       ├── converter/
│       │   └── index.jsx    ← Ana dönüştürme sayfası (dashboard)
│       └── history/
│           └── index.jsx    ← Geçmiş sayfası
├── components/
│   └── converter/
│       ├── ThemeSelector.jsx    ← Tema seçim kartları
│       ├── ImageUploader.jsx    ← Fotoğraf yükleme alanı
│       ├── ConversionResult.jsx ← Sonuç gösterimi
│       └── HistoryCard.jsx      ← Geçmiş öğesi kartı
```

---

## SAYFA VE BİLEŞEN DETAYLARI

### 1. `src/lib/gemini.js` — AI Servis Katmanı

```js
// Google Gemini 1.5 Flash API entegrasyonu
// Fonksiyonlar:
// - analyzeAndConvert(imageBase64, mimeType, themePrompt): Promise<{description, imagePrompt}>
// - Görüntüyü base64'e çevir, Gemini'ye gönder
// - Model: gemini-1.5-flash
// - API endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
// - API key: process.env.REACT_APP_GEMINI_API_KEY (query param olarak)
// - İstek body'si: { contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64 } }] }] }
// - Hata yönetimi: try/catch, anlamlı hata mesajları döndür
```

**Tema prompt şablonları** (`src/lib/themes.js` olarak ayrı dosyada):

```js
export const THEMES = [
  {
    slug: 'minecraft',
    label: 'Minecraft Skin',
    description: 'Piksel sanat tarzı blok karakter',
    icon: 'FaCube', // react-icons/fa
    color: 'green',
    prompt: `You are a Minecraft skin artist. Analyze this person's photo carefully.
    Describe a Minecraft character skin that resembles this person:
    - Pixel art style, blocky 8-bit aesthetic
    - Identify the person's hair color, eye color, skin tone, and clothing colors
    - Describe the skin layout: head (face features, hair), body (shirt/clothing color), arms, legs
    - Keep it to 64x64 pixel skin format description
    - Mention specific pixel color codes (hex) for main colors
    - Output format: Brief character description + color palette + style notes
    Keep the response under 200 words.`
  },
  {
    slug: 'roblox',
    label: 'Roblox Avatar',
    description: 'Yuvarlak kafa, blok vücut tarzı',
    icon: 'FaGamepad',
    color: 'red',
    prompt: `You are a Roblox avatar designer. Analyze this person's photo.
    Create a Roblox-style avatar description matching this person:
    - Characteristic round head, blocky proportions
    - Cartoonish, colorful style
    - Match hair color, eye color, and outfit to the person
    - Describe face accessories, clothing items, and color scheme
    - Roblox avatar uses simple geometric shapes and bright colors
    Keep the response under 200 words.`
  },
  {
    slug: 'among-us',
    label: 'Among Us',
    description: 'Uzay astronot tarzı karakter',
    icon: 'FaUserAstronaut',
    color: 'purple',
    prompt: `You are an Among Us character designer. Analyze this person's photo.
    Create an Among Us crewmate design inspired by this person:
    - Classic Among Us bean-shaped body with visor
    - Choose a suit color that matches or complements the person's clothing
    - Add a matching hat or accessory that reflects their personality/appearance
    - Describe the color scheme: suit color, visor color, any pet
    - Keep the iconic Among Us silhouette
    Keep the response under 150 words.`
  },
  {
    slug: 'pixel-rpg',
    label: 'Pixel RPG Hero',
    description: 'Klasik JRPG piksel karakter',
    icon: 'FaDragon',
    color: 'yellow',
    prompt: `You are a pixel art RPG character designer. Analyze this person's photo.
    Design a classic JRPG pixel art character based on this person:
    - 16-bit or 32-bit pixel art style (Final Fantasy, Zelda inspired)
    - Match the person's hair, eye color, and complexion
    - Choose an RPG class that fits their appearance (Warrior, Mage, Archer, etc.)
    - Describe equipment, clothing, and color palette
    - Include character stats flavor text (e.g., "The Brave Warrior of the East")
    Keep the response under 200 words.`
  },
  {
    slug: 'stardew',
    label: 'Stardew Valley',
    description: 'Çiftlik oyunu tarzı sevimli karakter',
    icon: 'FaSeedling',
    color: 'teal',
    prompt: `You are a Stardew Valley character designer. Analyze this person's photo.
    Create a Stardew Valley-style farmer character based on this person:
    - Cute, charming pixel art style with warm colors
    - Match hair color, eye color, and skin tone
    - Choose a farmer outfit that reflects their personality
    - Add a seasonal accessory (hat, tool, pet)
    - Describe the character's farm specialty (crops, animals, fishing, mining)
    - Warm, cozy aesthetic with earthy color palette
    Keep the response under 200 words.`
  }
]
```

### 2. `src/contexts/AuthContext.js`

Şu fonksiyonları içeren bir Context oluştur:
- `user` state (Supabase user objesi)
- `loading` state
- `signIn(email, password)` → supabase.auth.signInWithPassword
- `signUp(email, password, displayName)` → supabase.auth.signUp
- `signOut()` → supabase.auth.signOut
- `useEffect` ile `supabase.auth.onAuthStateChange` dinle
- `src/index.js` dosyasında `<App>` bileşenini `<AuthProvider>` ile sar

### 3. `src/views/auth/signIn/index.jsx` — Giriş Sayfası

Mevcut Horizon UI auth sayfasının stilini koru, sadece form işlevselliğini değiştir:
- Email + şifre alanları (Chakra UI `FormControl`, `Input`)
- "Giriş Yap" butonu → `signIn()` çağrısı
- Hata mesajı gösterimi (Chakra UI `Alert`)
- "Hesap yok mu? Kayıt ol" linki → `/auth/sign-up`
- Başarılı girişte → `/admin/converter` yönlendir
- Loading state: buton disabled + spinner

### 4. `src/views/auth/signUp/index.jsx` — Kayıt Sayfası

- Ad, email, şifre alanları
- Şifre tekrar doğrulama (client-side)
- `signUp()` çağrısı
- Başarılı kayıtta email doğrulama mesajı göster
- Horizon UI'ın mevcut auth layout'unu kullan

### 5. `src/views/admin/converter/index.jsx` — Ana Sayfa (Dashboard)

Bu sayfanın layout'u:
- Üst kısım: karşılama metni + kullanıcı adı
- Sol/orta: Tema seçim kartları (`ThemeSelector`)
- Sağ: Fotoğraf yükleme alanı (`ImageUploader`)
- Alt: Dönüşüm butonu + sonuç alanı (`ConversionResult`)
- Tüm state bu sayfada tutulur: `selectedTheme`, `uploadedImage`, `isConverting`, `result`

**Dönüşüm akışı:**
```
1. Kullanıcı tema seçer → selectedTheme set edilir
2. Kullanıcı fotoğraf yükler → File objesi + önizleme URL state'e alınır
3. "Dönüştür" butonuna basar → isConverting: true
4. Görüntü base64'e çevrilir (FileReader)
5. gemini.js → analyzeAndConvert() çağrılır
6. Sonuç Supabase conversions tablosuna kaydedilir
7. ConversionResult bileşenine sonuç aktarılır
8. isConverting: false
```

### 6. `src/components/converter/ThemeSelector.jsx`

- `THEMES` dizisini map ederek kart grid'i oluştur
- Chakra UI `SimpleGrid` (columns: 2 veya 3, responsive)
- Her kart: `Card` bileşeni, tema ikonu, isim, açıklama
- Seçili kart: `borderColor="brand.500" borderWidth="2px"` vurgusu
- Hover efekti: `_hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}`
- `useColorModeValue` ile dark/light mode uyumlu renkler

### 7. `src/components/converter/ImageUploader.jsx`

- `react-dropzone` kullan (şablonda zaten kurulu)
- Sürükle-bırak alanı + "Dosya seç" butonu
- Önizleme: yüklenen fotoğraf `<Image>` ile gösterilir
- Dosya boyutu limiti: 5MB
- Kabul edilen tipler: `image/jpeg`, `image/png`, `image/webp`
- Hata mesajları: boyut aşımı, yanlış format
- Chakra UI bileşenleri ile stillendir

### 8. `src/components/converter/ConversionResult.jsx`

- `result` prop'u: `{ description, status, created_at }`
- Status: `pending` → spinner, `done` → sonuç göster, `error` → hata mesajı
- Sonuç kartı: AI'ın ürettiği karakter açıklaması + metadata
- "İndir" butonu → açıklamayı `.txt` olarak indir (görsel üretimi 2. aşama)
- "Yeniden Dönüştür" butonu
- Chakra UI `Card`, `Text`, `Badge`, `Button` kullan
- Framer Motion ile `motion.div` fade-in animasyonu

### 9. `src/views/admin/history/index.jsx` — Geçmiş Sayfası

- Supabase'den `conversions` tablosunu çek (kullanıcıya ait, `created_at DESC`)
- `useConversions` hook kullan
- Chakra UI `SimpleGrid` ile kart listesi
- Her kart (`HistoryCard`): tema adı, tarih, kısa açıklama önizlemesi, durum badge'i
- Boş state: "Henüz dönüşüm yok" mesajı + CTA butonu
- Loading state: skeleton kartlar (`Skeleton` bileşeni)
- Silme butonu: Supabase'den kaydı sil + local state güncelle

### 10. `src/hooks/useConversions.js`

```js
// Custom hook
// - conversions state []
// - loading, error state
// - fetchConversions(): supabase.from('conversions').select('*').eq('user_id', user.id).order('created_at', {ascending: false})
// - deleteConversion(id): supabase.from('conversions').delete().eq('id', id)
// - addConversion(data): optimistic update + supabase insert
// useEffect ile sayfa yüklendiğinde otomatik çek
```

---

## ROUTING YAPISI

`src/App.js` dosyasını şu route'larla güncelle:

```
/auth/sign-in       → SignIn sayfası (auth layout)
/auth/sign-up       → SignUp sayfası (auth layout)
/admin/converter    → Converter sayfası (admin layout) [korumalı]
/admin/history      → History sayfası (admin layout) [korumalı]
/                   → /admin/converter'a redirect
```

Korumalı route için `ProtectedRoute` bileşeni yaz:
- `user` yoksa `/auth/sign-in`'e yönlendir
- `loading` true ise tam ekran spinner göster

---

## SIDEBAR MENÜ

Horizon UI'ın mevcut sidebar yapısına (`src/routes.js` veya benzeri) şu menü öğelerini ekle:

```js
{
  name: "Dönüştürücü",
  layout: "/admin",
  path: "converter",
  icon: <Icon as={FaMagic} />,
},
{
  name: "Geçmişim",
  layout: "/admin",
  path: "history",
  icon: <Icon as={FaHistory} />,
}
```

---

## HATA YÖNETİMİ VE UX

Tüm async işlemlerde:
- Try/catch ile hataları yakala
- Chakra UI `useToast()` ile kullanıcıya bildirim göster:
  - Başarı: `status: "success"`, yeşil
  - Hata: `status: "error"`, kırmızı
  - Bilgi: `status: "info"`, mavi
- Gemini API hata mesajlarını Türkçe'ye çevir
- Network hatası için yeniden deneme butonu

---

## GÜVENLİK

- API key'leri sadece `.env` dosyasında tut, hiçbir zaman component içine yazma
- Supabase RLS (Row Level Security) aktif olacak, SQL script'te gösterildi
- Dosya yükleme: client-side validasyon (boyut, format) zorunlu
- Rate limiting için bir `useRef` ile son istek zamanını takip et, 30 saniyede bir istek sınırı koy

---

## KOD KALİTESİ KURALLARI

1. Her dosya için JSDoc yorum satırları ekle
2. PropTypes tanımla (TypeScript yoksa)
3. Magic string kullanma, sabitler için `constants.js` oluştur
4. Her bileşen max 150 satır olsun, büyüyünce böl
5. Chakra UI'ın `useColorModeValue` hook'unu tüm renk tanımlarında kullan
6. `console.log` bırakma, sadece `console.error` kullan

---

## BAŞLANGIÇ SIRASI

Dosyaları şu sırada oluştur:
1. `.env` (boş template)
2. `src/lib/supabase.js`
3. `src/lib/themes.js`
4. `src/lib/gemini.js`
5. `src/contexts/AuthContext.js`
6. `src/hooks/useConversions.js`
7. Auth sayfaları (signIn, signUp)
8. Converter bileşenleri (ThemeSelector, ImageUploader, ConversionResult, HistoryCard)
9. Admin sayfaları (converter/index.jsx, history/index.jsx)
10. App.js routing güncellemesi + sidebar

---

## KURULUM KOMUTU

Projeye şu paketi ekle:
```bash
npm install @supabase/supabase-js
```

Diğer tüm bağımlılıklar (react-dropzone, framer-motion, react-icons, chakra-ui) şablonda zaten mevcut.