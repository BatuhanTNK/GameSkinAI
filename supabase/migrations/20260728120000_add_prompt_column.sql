-- Prompt Kütüphanesi özelliği (ozellik_onerileri.md #10)
-- Üretilen görsel prompt'unu saklamak için conversions tablosuna prompt kolonu ekler.
ALTER TABLE public.conversions ADD COLUMN IF NOT EXISTS prompt TEXT;
