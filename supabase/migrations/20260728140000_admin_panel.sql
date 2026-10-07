-- Admin Paneli (#13) — ozellik_onerileri.md
-- is_admin kolonu, admin yardımcı fonksiyonu ve tema/moderasyon RLS politikaları.

-- 1. profiles tablosuna is_admin kolonu
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Kullanıcıların kendi is_admin alanını değiştirmesini engelle (yetki yükseltme koruması)
REVOKE UPDATE (is_admin) ON public.profiles FROM authenticated;
REVOKE UPDATE (is_admin) ON public.profiles FROM anon;

-- 2. Admin kontrolü için yardımcı fonksiyon (RLS içinde recursion önlemek için SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    false
  );
$$;

-- 3. themes politikaları: adminler tüm temaları okuyabilir ve yönetebilir
DROP POLICY IF EXISTS "Admins can read all themes" ON public.themes;
DROP POLICY IF EXISTS "Admins can insert themes" ON public.themes;
DROP POLICY IF EXISTS "Admins can update themes" ON public.themes;
DROP POLICY IF EXISTS "Admins can delete themes" ON public.themes;

CREATE POLICY "Admins can read all themes"
  ON public.themes FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert themes"
  ON public.themes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update themes"
  ON public.themes FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete themes"
  ON public.themes FOR DELETE
  USING (public.is_admin());

-- 4. conversions moderasyonu: adminler herhangi bir dönüşümü güncelleyebilir (public gizleme)
DROP POLICY IF EXISTS "Admins can update any conversion" ON public.conversions;

CREATE POLICY "Admins can update any conversion"
  ON public.conversions FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. comments moderasyonu: adminler herhangi bir yorumu silebilir
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;

CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  USING (public.is_admin());

-- 6. İlk admin atama (manuel — SQL Editor'da e-postanı yazarak çalıştır):
-- UPDATE public.profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'seninmailin@ornek.com');
