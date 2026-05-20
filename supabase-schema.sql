-- =============================================
-- EDUSTORE — Schéma Supabase
-- Colle ce code dans : Supabase → SQL Editor → New Query
-- =============================================

-- 1. PRODUCTS
CREATE TABLE products (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_fr      TEXT NOT NULL,
  title_ar      TEXT NOT NULL,
  subject_fr    TEXT NOT NULL DEFAULT '',
  subject_ar    TEXT NOT NULL DEFAULT '',
  description_fr TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  level         TEXT CHECK (level IN ('lycee', 'uni', 'pro')) NOT NULL,
  type          TEXT CHECK (type IN ('course', 'homework', 'project', 'exam')) NOT NULL,
  price         NUMERIC(8,2) NOT NULL DEFAULT 0,
  pages         INTEGER DEFAULT 0,
  downloads     INTEGER DEFAULT 0,
  preview_pages INTEGER DEFAULT 3,
  pdf_url       TEXT DEFAULT '',
  cover_color   TEXT DEFAULT '#e8f0fe',
  cover_accent  TEXT DEFAULT '#4f8ef7',
  published     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIENTS
CREATE TABLE clients (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  phone      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS
CREATE TABLE orders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id       UUID REFERENCES clients(id),
  client_name     TEXT NOT NULL,
  client_email    TEXT NOT NULL,
  payment_method  TEXT NOT NULL,
  total           NUMERIC(8,2) NOT NULL DEFAULT 0,
  status          TEXT CHECK (status IN ('pending','paid','cancelled')) DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER_ITEMS
CREATE TABLE order_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id   UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  price      NUMERIC(8,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEX pour les performances
-- ─────────────────────────────────────────
CREATE INDEX idx_products_level    ON products(level);
CREATE INDEX idx_products_type     ON products(type);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_client     ON orders(client_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ─────────────────────────────────────────
-- RLS (Row Level Security)
-- Lecture publique sur products
-- ─────────────────────────────────────────
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Lecture publique des produits publiés
CREATE POLICY "produits publics" ON products
  FOR SELECT USING (published = true);

-- N'importe qui peut créer une commande
CREATE POLICY "créer commande" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "créer client" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "voir client existant" ON clients
  FOR SELECT USING (true);

CREATE POLICY "créer items" ON order_items
  FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────
-- STORAGE : bucket "pdfs"
-- À créer dans Supabase → Storage → New Bucket
-- Nom : pdfs | Public : true
-- ─────────────────────────────────────────

-- ─────────────────────────────────────────
-- DONNÉES DE TEST (optionnel)
-- ─────────────────────────────────────────
INSERT INTO products (title_fr, title_ar, subject_fr, subject_ar, level, type, price, pages, downloads, cover_color, cover_accent)
VALUES
  ('Cours de mathématiques S2',    'درس رياضيات الفصل الثاني',    'Mathématiques', 'رياضيات', 'lycee', 'course',   8,  42, 67, '#e8f0fe', '#4f8ef7'),
  ('Annales du Bac — Physique',    'امتحانات البكالوريا — فيزياء', 'Physique',      'فيزياء',  'lycee', 'exam',    10,  58, 54, '#fef3c7', '#f59e0b'),
  ('Projet informatique — BDD',    'مشروع إعلامية — قواعد البيانات','Informatique', 'إعلامية', 'uni',   'project', 15,  34, 43, '#f0fdf4', '#22c55e'),
  ('Résumé droit des obligations', 'ملخص قانون الالتزامات',        'Droit',         'قانون',   'uni',   'course',  12,  48, 33, '#fce7f3', '#ec4899'),
  ('Devoir physique corrigé',      'واجب فيزياء محلول',            'Physique',      'فيزياء',  'lycee', 'homework', 5,  12, 21, '#ede9fe', '#7c3aed'),
  ('Formation Excel avancé',       'تكوين إكسل متقدم',             'Bureautique',   'مكتبيات', 'pro',   'course',  20,  65, 18, '#ecfdf5', '#059669');
