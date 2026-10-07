-- İlk admin ataması (ozellik_onerileri.md #13)
-- batuhan.tonk.1@... hesabını admin yapar. Profil satırı yoksa oluşturur (eski
-- kayıtlar handle_new_user trigger'ından önce oluşmuş olabilir).

INSERT INTO public.profiles (id, display_name, is_admin)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
  true
FROM auth.users u
WHERE lower(u.email) LIKE 'batuhan.tonk.1@%'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
