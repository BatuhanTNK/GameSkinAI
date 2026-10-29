-- Earlier migrations only documented this bucket; they did not create it or its policies.
-- Existing bucket settings and unrelated policies are preserved.
INSERT INTO storage.buckets (id, name, public)
VALUES ('conversions', 'conversions', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Conversion owners can upload images" ON storage.objects;
CREATE POLICY "Conversion owners can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'conversions' AND owner_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Conversion owners can read images" ON storage.objects;
CREATE POLICY "Conversion owners can read images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'conversions' AND owner_id = (SELECT auth.uid())::text);
