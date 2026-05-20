# EduStore — Guide de mise en place

## 1. Installer le projet

```bash
npm install
```

## 2. Configurer Supabase

### Créer le projet Supabase
1. Va sur https://supabase.com et crée un compte gratuit
2. Clique "New Project" → donne un nom → choisis une région proche (Europe West)
3. Note le **mot de passe** de ta base de données

### Créer les tables
1. Dans ton projet Supabase → clique **SQL Editor**
2. Clique "New Query"
3. Colle le contenu du fichier `supabase-schema.sql`
4. Clique **Run** ✅

### Créer le bucket PDF
1. Dans Supabase → **Storage** → "New Bucket"
2. Nom : `pdfs`
3. Coche "Public bucket" ✅
4. Clique "Create bucket"

### Récupérer tes clés API
1. Dans Supabase → **Settings** → **API**
2. Copie :
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public key** → `eyJhbGci...`

## 3. Configurer les variables d'environnement

```bash
# Copie le fichier exemple
cp .env.example .env

# Ouvre .env et remplace par tes vraies clés :
REACT_APP_SUPABASE_URL=https://TON-PROJET.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

## 4. Lancer en local

```bash
npm start
# → http://localhost:3000
```

## 5. Déployer sur Vercel (gratuit)

```bash
# Installe Vercel CLI
npm install -g vercel

# Déploie
vercel

# Configure les variables d'environnement sur Vercel :
# Dashboard Vercel → ton projet → Settings → Environment Variables
# Ajoute REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY
```

## Structure du projet

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation bilingue FR/AR
│   └── ProductCard.jsx     # Carte produit
├── context/
│   ├── LangContext.jsx     # Système bilingue FR/AR + RTL
│   └── CartContext.jsx     # Panier global
├── lib/
│   ├── supabase.js         # Client Supabase
│   ├── api.js              # Toutes les fonctions API
│   └── data.js             # Données de fallback (sans Supabase)
└── pages/
    ├── Home.jsx            # Page d'accueil
    ├── Catalog.jsx         # Catalogue avec filtres
    ├── Cart.jsx            # Panier + paiement
    └── Admin.jsx           # Dashboard admin complet
```

## Pages disponibles

| URL        | Page                    |
|------------|-------------------------|
| `/`        | Accueil                 |
| `/catalog` | Catalogue + filtres     |
| `/cart`    | Panier + paiement       |
| `/admin`   | Dashboard administrateur|

## Méthodes de paiement intégrées

- **Flouci** — paiement mobile tunisien
- **D17** — application de paiement
- **Virement bancaire** — RIB envoyé par email
- **PayPal** — paiement international
- **Carte bancaire** — Visa / Mastercard

## 6. Créer le compte administrateur (Supabase Auth)

1. Dans Supabase → **Authentication** → **Users**
2. Clique **"Invite user"**
3. Entre ton email admin (ex: `admin@edustore.tn`)
4. Tu recevras un email — clique le lien pour définir ton mot de passe
5. Connecte-toi sur `/login` avec cet email + mot de passe ✅

> La route `/admin` est protégée : sans connexion, elle redirige automatiquement vers `/login`.

## Sécurité — Règles RLS Supabase pour l'admin

Ajoute ces politiques dans **Supabase → SQL Editor** pour que seuls les admins connectés puissent modifier les données :

```sql
-- Seuls les utilisateurs connectés peuvent gérer les produits
CREATE POLICY "admin produits" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Seuls les admins voient toutes les commandes
CREATE POLICY "admin commandes" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Seuls les admins voient les clients
CREATE POLICY "admin clients" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 7. Déploiement sur Vercel

### Méthode recommandée : via GitHub (la plus simple)

**Étape 1 — Mettre le projet sur GitHub**
1. Va sur https://github.com et crée un compte (gratuit)
2. Clique "New repository" → nom : `edustore` → Public → Create
3. Sur ton PC, dans le dossier `edustore/` :
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TON-USER/edustore.git
git push -u origin main
```

**Étape 2 — Connecter à Vercel**
1. Va sur https://vercel.com → "Sign up with GitHub"
2. Clique "New Project" → importe `edustore`
3. Framework : **Create React App** (détecté automatiquement)
4. Clique **"Environment Variables"** et ajoute :
   ```
   REACT_APP_SUPABASE_URL    = https://xxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJhbGci...
   ```
5. Clique **Deploy** 🚀

→ Ton site sera en ligne sur `https://edustore.vercel.app` en 2 minutes !

**Étape 3 — Domaine personnalisé (optionnel)**
1. Achète un domaine `.tn` ou `.com` (~15 TND/an sur OVH ou Gandi)
2. Dans Vercel → ton projet → Settings → Domains → Add
3. Suis les instructions DNS (5 minutes)
