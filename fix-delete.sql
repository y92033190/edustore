-- Correction suppression produits
-- Colle dans Supabase → SQL Editor → Run

DROP POLICY IF EXISTS "admin delete" ON products;

CREATE POLICY "admin delete" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Vérifie aussi que le RLS est bien activé
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
