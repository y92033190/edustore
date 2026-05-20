import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { getProducts, getDashboardStats } from '../lib/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const { t, lang } = useLang();
  const [popular, setPopular]   = useState([]);
  const [stats, setStats]       = useState({ totalProducts: 0, totalClients: 0, paidOrders: 0 });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [prods, st] = await Promise.all([getProducts(), getDashboardStats()]);
        const sorted = [...prods].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 3);
        setPopular(sorted);
        setStats(st);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content fade-up">
            <div className="hero-badge">🎓 EduStore — منصة التعليم</div>
            <h1 className="hero-title">
              {t.hero.title.split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h1>
            <p className="hero-subtitle">{t.hero.subtitle}</p>
            <div className="hero-actions">
              <Link to="/catalog" className="hero-cta">{t.hero.cta}</Link>
              <a href="#popular" className="hero-cta2">{t.hero.cta2}</a>
            </div>
          </div>
          <div className="hero-visual fade-up">
            <div className="floating-card card1">
              <span>📖</span>
              <div>
                <div className="fc-title">{lang === 'fr' ? 'Cours de maths S2' : 'درس رياضيات'}</div>
                <div className="fc-price">8 TND</div>
              </div>
            </div>
            <div className="floating-card card2">
              <span>💻</span>
              <div>
                <div className="fc-title">{lang === 'fr' ? 'Projet informatique' : 'مشروع إعلامية'}</div>
                <div className="fc-price">15 TND</div>
              </div>
            </div>
            <div className="floating-card card3">
              <span>✅</span>
              <div>
                <div className="fc-title">{stats.paidOrders} {lang === 'fr' ? 'ventes' : 'مبيعات'}</div>
                <div className="fc-price">{lang === 'fr' ? 'ce mois' : 'هذا الشهر'}</div>
              </div>
            </div>
            <div className="hero-blob"></div>
          </div>
        </div>
      </section>

      {/* Stats réelles */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-item">
            <div className="stat-number">{stats.totalProducts}</div>
            <div className="stat-label">{t.stats.courses}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalClients}</div>
            <div className="stat-label">{t.stats.students}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.paidOrders}</div>
            <div className="stat-label">{lang === 'fr' ? 'Ventes réalisées' : 'مبيعات منجزة'}</div>
          </div>
        </div>
      </section>

      {/* Produits populaires — depuis Supabase */}
      <section className="popular-section" id="popular">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t.catalog.title}</h2>
            <Link to="/catalog" className="section-link">{t.hero.cta} →</Link>
          </div>

          {loading ? (
            <div className="products-grid">
              {[1,2,3].map(i => <div key={i} className="skeleton-card" style={{ height: 320, borderRadius: 12, background: 'var(--border)', animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%' }} />)}
            </div>
          ) : popular.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text2)' }}>
              {lang === 'fr'
                ? 'Aucun cours encore — ajoute-en depuis le dashboard admin !'
                : 'لا توجد دروس بعد — أضفها من لوحة الإدارة!'}
            </div>
          ) : (
            <div className="products-grid">
              {popular.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Méthodes de paiement */}
      <section className="payment-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 24 }}>
            {t.payment.title}
          </h2>
          <div className="payment-methods">
            {['💳 Flouci', '📱 D17', '🏦 Virement', '🌐 PayPal', '💰 Carte'].map(m => (
              <div key={m} className="payment-badge">{m}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
