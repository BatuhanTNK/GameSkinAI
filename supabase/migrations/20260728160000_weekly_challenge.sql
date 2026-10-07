-- Haftalık Yarışma / Challenge (ozellik_onerileri.md #14)
-- Haftanın temasını tanımlayan challenges tablosu. Kayıt yoksa frontend
-- deterministik rotasyonla (hafta numarası % tema sayısı) tema belirler.
-- Kazanan, hafta aralığındaki en çok beğeni alan public dönüşümden hesaplanır.

CREATE TABLE IF NOT EXISTS public.challenges (
  id SERIAL PRIMARY KEY,
  week_key TEXT UNIQUE NOT NULL,          -- Haftanın pazartesi tarihi (YYYY-MM-DD)
  theme_slug TEXT NOT NULL,
  theme_label TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Herkes challenge'ları okuyabilir
DROP POLICY IF EXISTS "Anyone can read challenges" ON public.challenges;
CREATE POLICY "Anyone can read challenges"
  ON public.challenges FOR SELECT
  USING (true);

-- Sadece adminler challenge tanımlayabilir/güncelleyebilir
DROP POLICY IF EXISTS "Admins can insert challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can update challenges" ON public.challenges;
DROP POLICY IF EXISTS "Admins can delete challenges" ON public.challenges;

CREATE POLICY "Admins can insert challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update challenges"
  ON public.challenges FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete challenges"
  ON public.challenges FOR DELETE
  USING (public.is_admin());

-- Liderlik sorguları için index (tema + tarih aralığı + beğeni)
CREATE INDEX IF NOT EXISTS idx_conversions_challenge
  ON public.conversions (theme_slug, created_at)
  WHERE is_public = true;
