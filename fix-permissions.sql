-- =============================================
-- CORRECTION DES PERMISSIONS SUPABASE
-- Colle ce code dans SQL Editor → Run
-- =============================================

-- Supprime les anciennes politiques sur products
DROP POLICY IF EXISTS "produits publics" ON products;
DROP POLICY IF EXISTS "admin produits" ON products;

-- Lecture publique (tout le monde peut voir les produits)
CREATE POLICY "lecture publique" ON products
  FOR SELECT USING (published = true);

-- Admin peut tout faire (insérer, modifier, supprimer)
CREATE POLICY "admin insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin update" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "admin delete" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Permissions pour le storage (upload PDF)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "upload pdf" ON storage.objects;
DROP POLICY IF EXISTS "lecture pdf" ON storage.objects;

CREATE POLICY "upload pdf" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "lecture pdf" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdfs');
