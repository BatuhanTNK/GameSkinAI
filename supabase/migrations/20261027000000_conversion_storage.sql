-- Earlier migrations only documented this bucket; they did not create it or its policies.
-- Existing bucket settings and unrelated policies are preserved.
INSERT INTO storage.buckets (id, name, public)
VALUES ('conversions', 'conversions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Conversion owners can upload images" ON storage.objects;
CREATE POLICY "Conversion owners can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'conversions' AND owner_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Conversion owners can read images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read conversion images" ON storage.objects;
CREATE POLICY "Anyone can read conversion images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'conversions');
