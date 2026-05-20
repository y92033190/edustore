import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { PRODUCTS } from '../lib/data';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const { t } = useLang();
  const popular = [...PRODUCTS].sort((a, b) => b.downloads - a.downloads).slice(0, 3);

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
                <div className="fc-title">Cours de maths S2</div>
                <div className="fc-price">8 TND</div>
              </div>
            </div>
            <div className="floating-card card2">
              <span>💻</span>
              <div>
                <div className="fc-title">Projet informatique</div>
                <div className="fc-price">15 TND</div>
              </div>
            </div>
            <div className="floating-card card3">
              <span>✅</span>
              <div>
                <div className="fc-title">387 ventes</div>
                <div className="fc-price">ce mois</div>
              </div>
            </div>
            <div className="hero-blob"></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-item">
            <div className="stat-number">54</div>
            <div className="stat-label">{t.stats.courses}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">213</div>
            <div className="stat-label">{t.stats.students}</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">12</div>
            <div className="stat-label">{t.stats.subjects}</div>
          </div>
        </div>
      </section>

      {/* Popular courses */}
      <section className="popular-section" id="popular">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t.catalog.title}</h2>
            <Link to="/catalog" className="section-link">
              {t.hero.cta} →
            </Link>
          </div>
          <div className="products-grid">
            {popular.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Payment methods */}
      <section className="payment-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 24 }}>
            {t.payment.title}
          </h2>
          <div className="payment-methods">
            {['💳 Flouci', '📱 D17', '🏦 Virement', '💰 PayPal', '💳 Carte'].map(m => (
              <div key={m} className="payment-badge">{m}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
