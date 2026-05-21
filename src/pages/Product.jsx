import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { getProductById } from '../lib/api';
import { PRODUCTS } from '../lib/data';
import './Product.css';

export default function Product() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const { add, items } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewPage, setPreviewPage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch {
      // fallback données locales
      const local = PRODUCTS.find(p => String(p.id) === String(id));
      setProduct(local || null);
    } finally {
      setLoading(false);
    }
  }

  const inCart = product && items.find(i => String(i.id) === String(product.id));

  const handleAddToCart = () => {
    if (!product || inCart) return;
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const typeLabels = {
    course:   { fr: 'Cours',    ar: 'درس'       },
    homework: { fr: 'Devoir',   ar: 'واجب'      },
    project:  { fr: 'Projet',   ar: 'مشروع'     },
    exam:     { fr: 'Annales',  ar: 'امتحانات'  },
  };

  const levelLabels = {
    lycee: { fr: 'Lycée',      ar: 'ثانوية' },
    uni:   { fr: 'Université', ar: 'جامعة'   },
    pro:   { fr: 'Formation',  ar: 'تكوين'   },
  };

  // Simulate preview pages content
  const PREVIEW_PAGES = [
    {
      title_fr: 'Sommaire', title_ar: 'الفهرس',
      lines: [
        { w: '60%', indent: false }, { w: '45%', indent: true },
        { w: '55%', indent: true  }, { w: '50%', indent: false },
        { w: '40%', indent: true  }, { w: '48%', indent: true  },
        { w: '52%', indent: false }, { w: '38%', indent: true  },
      ],
    },
    {
      title_fr: 'Introduction', title_ar: 'مقدمة',
      lines: [
        { w: '100%' }, { w: '95%' }, { w: '88%' }, { w: '100%' },
        { w: '92%'  }, { w: '78%' }, { w: '100%' }, { w: '85%' },
        { w: '96%'  }, { w: '60%' },
      ],
    },
    {
      title_fr: 'Chapitre 1', title_ar: 'الفصل الأول',
      lines: [
        { w: '100%' }, { w: '90%' }, { w: '100%' }, { w: '82%' },
        { h: true   },
        { w: '100%' }, { w: '94%' }, { w: '88%'  }, { w: '70%' },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="product-skeleton">
            <div className="skel skel-cover" />
            <div className="skel-info">
              <div className="skel skel-title" />
              <div className="skel skel-line" />
              <div className="skel skel-line short" />
              <div className="skel skel-btn" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="not-found">
            <div style={{ fontSize: 48 }}>😕</div>
            <h2>{lang === 'fr' ? 'Produit introuvable' : 'المنتج غير موجود'}</h2>
            <Link to="/catalog" className="back-link">
              ← {lang === 'fr' ? 'Retour au catalogue' : 'العودة إلى الكتالوج'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title       = lang === 'fr' ? product.title_fr       : product.title_ar;
  const subject     = lang === 'fr' ? product.subject_fr     : product.subject_ar;
  const description = lang === 'fr' ? product.description_fr : product.description_ar;
  const typeLbl     = typeLabels[product.type]?.[lang === 'fr' ? 'fr' : 'ar']  || product.type;
  const levelLbl    = levelLabels[product.level]?.[lang === 'fr' ? 'fr' : 'ar'] || product.level;

  const previewCount = Math.min(product.preview_pages || 3, PREVIEW_PAGES.length);

  return (
    <div className="product-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">{lang === 'fr' ? 'Accueil' : 'الرئيسية'}</Link>
          <span>/</span>
          <Link to="/catalog">{lang === 'fr' ? 'Catalogue' : 'الكتالوج'}</Link>
          <span>/</span>
          <span>{title}</span>
        </nav>

        <div className="product-layout">

          {/* ── LEFT : Cover + Preview ── */}
          <div className="product-left">
            <div className="product-cover" style={{ background: product.cover_color }}>
              <div className="cover-emoji">
                {product.type === 'course'   && '📖'}
                {product.type === 'homework' && '✏️'}
                {product.type === 'project'  && '💻'}
                {product.type === 'exam'     && '📝'}
              </div>
              <div className="cover-title">{title}</div>
              <div className="cover-subject" style={{ color: product.cover_accent }}>{subject}</div>
              <div className="cover-meta">
                <span style={{ background: product.cover_accent, color: 'white' }} className="cover-badge">
                  {typeLbl}
                </span>
                <span className="cover-pages">{product.pages} {t.catalog.pages}</span>
              </div>
              {/* Decorative lines */}
              <div className="cover-lines">
                {[80, 65, 72, 55, 68].map((w, i) => (
                  <div key={i} className="cover-line" style={{ width: `${w}%`, background: product.cover_accent, opacity: 0.15 + i * 0.04 }} />
                ))}
              </div>
            </div>

            {/* Preview strip */}
            <div className="preview-strip">
              <div className="preview-strip-label">
                {lang === 'fr' ? `Aperçu gratuit — ${previewCount} pages` : `معاينة مجانية — ${previewCount} صفحات`}
              </div>
              <div className="preview-thumbnails">
                {PREVIEW_PAGES.slice(0, previewCount).map((pg, i) => (
                  <button
                    key={i}
                    className={`thumb ${previewPage === i ? 'active' : ''}`}
                    onClick={() => { setPreviewPage(i); setPreviewOpen(true); }}
                  >
                    <div className="thumb-inner">
                      <div className="thumb-pg-title">
                        {lang === 'fr' ? pg.title_fr : pg.title_ar}
                      </div>
                      {pg.lines.slice(0, 5).map((l, j) => (
                        l.h
                          ? <div key={j} className="thumb-spacer" />
                          : <div key={j} className="thumb-line" style={{ width: l.w, marginLeft: l.indent ? '10%' : 0 }} />
                      ))}
                    </div>
                    <div className="thumb-num">{i + 1}</div>
                  </button>
                ))}
              </div>
              <button className="btn-open-preview" onClick={() => setPreviewOpen(true)}>
                👁 {lang === 'fr' ? 'Ouvrir l\'aperçu' : 'فتح المعاينة'}
              </button>
            </div>
          </div>

          {/* ── RIGHT : Info + Purchase ── */}
          <div className="product-right">
            <div className="product-tags">
              <span className="tag-subject" style={{ background: product.cover_color, color: product.cover_accent }}>
                {subject}
              </span>
              <span className="tag-level">{levelLbl}</span>
              <span className="tag-type">{typeLbl}</span>
            </div>

            <h1 className="product-title">{title}</h1>

            {description && (
              <p className="product-description">{description}</p>
            )}

            {/* Stats row */}
            <div className="product-stats">
              <div className="stat">
                <span className="stat-icon">📄</span>
                <div>
                  <div className="stat-val">{product.pages}</div>
                  <div className="stat-lbl">{lang === 'fr' ? 'Pages' : 'صفحة'}</div>
                </div>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-icon">⬇️</span>
                <div>
                  <div className="stat-val">{product.downloads || 0}</div>
                  <div className="stat-lbl">{lang === 'fr' ? 'Téléchargements' : 'تحميل'}</div>
                </div>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-icon">👁</span>
                <div>
                  <div className="stat-val">{product.preview_pages || 3}</div>
                  <div className="stat-lbl">{lang === 'fr' ? 'Pages aperçu' : 'صفحات معاينة'}</div>
                </div>
              </div>
            </div>

            {/* Price + CTA */}
            <div className="purchase-box">
              <div className="purchase-price">
                <span className="price-amount">{product.price}</span>
                <span className="price-currency">TND</span>
              </div>

              <div className="purchase-actions">
                <button
                  className={`btn-add-cart ${inCart || added ? 'added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!!inCart}
                >
                  {inCart
                    ? `✓ ${lang === 'fr' ? 'Dans le panier' : 'في السلة'}`
                    : added
                      ? `✓ ${lang === 'fr' ? 'Ajouté !' : 'تمت الإضافة!'}`
                      : `🛒 ${lang === 'fr' ? 'Ajouter au panier' : 'أضف إلى السلة'}`}
                </button>
                <Link to="/cart" className="btn-buy-now">
                  {lang === 'fr' ? 'Acheter maintenant →' : 'اشترِ الآن →'}
                </Link>
              </div>

              <div className="purchase-guarantee">
                <span>🔒</span>
                {lang === 'fr'
                  ? 'Paiement sécurisé · PDF livré immédiatement après confirmation'
                  : 'دفع آمن · يُسلَّم ملف PDF فور تأكيد الدفع'}
              </div>
            </div>

            {/* Details */}
            <div className="product-details">
              <h3>{lang === 'fr' ? 'Détails du contenu' : 'تفاصيل المحتوى'}</h3>
              <div className="details-grid">
                <div className="detail-row">
                  <span className="detail-label">{lang === 'fr' ? 'Type' : 'النوع'}</span>
                  <span className="detail-value">{typeLbl}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'fr' ? 'Niveau' : 'المستوى'}</span>
                  <span className="detail-value">{levelLbl}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'fr' ? 'Matière' : 'المادة'}</span>
                  <span className="detail-value">{subject}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'fr' ? 'Format' : 'الصيغة'}</span>
                  <span className="detail-value">PDF</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'fr' ? 'Pages' : 'الصفحات'}</span>
                  <span className="detail-value">{product.pages}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{lang === 'fr' ? 'Langue' : 'اللغة'}</span>
                  <span className="detail-value">{lang === 'fr' ? 'Français / العربية' : 'العربية / Français'}</span>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="payment-icons">
              <span className="payment-label">{lang === 'fr' ? 'Paiement via :' : 'الدفع عبر:'}</span>
              {['💳 Flouci', '📱 D17', '🏦 Virement', '🌐 PayPal'].map(m => (
                <span key={m} className="payment-pill">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PDF Preview Modal ── */}
      {previewOpen && (
        <div className="preview-modal" onClick={() => setPreviewOpen(false)}>
          <div className="preview-modal-inner" onClick={e => e.stopPropagation()}>

            <div className="preview-modal-header">
              <div className="preview-modal-title">
                {lang === 'fr' ? 'Aperçu gratuit' : 'معاينة مجانية'}
                <span className="preview-modal-sub">
                  {lang === 'fr' ? `Page ${previewPage + 1} / ${previewCount}` : `صفحة ${previewPage + 1} / ${previewCount}`}
                </span>
              </div>
              <button className="preview-close" onClick={() => setPreviewOpen(false)}>✕</button>
            </div>

            {/* Page navigation */}
            <div className="preview-nav">
              {PREVIEW_PAGES.slice(0, previewCount).map((pg, i) => (
                <button
                  key={i}
                  className={`preview-nav-btn ${previewPage === i ? 'active' : ''}`}
                  onClick={() => setPreviewPage(i)}
                >
                  {lang === 'fr' ? pg.title_fr : pg.title_ar}
                </button>
              ))}
            </div>

            {/* Simulated PDF page */}
            <div className="pdf-page">
              <div className="pdf-header">
                <div className="pdf-header-title">{title}</div>
                <div className="pdf-header-num">{previewPage + 1}</div>
              </div>
              <div className="pdf-chapter-title">
                {lang === 'fr'
                  ? PREVIEW_PAGES[previewPage].title_fr
                  : PREVIEW_PAGES[previewPage].title_ar}
              </div>
              <div className="pdf-content">
                {PREVIEW_PAGES[previewPage].lines.map((l, i) =>
                  l.h
                    ? <div key={i} className="pdf-spacer" />
                    : <div key={i} className="pdf-line" style={{ width: l.w, marginLeft: l.indent ? '1.5rem' : 0 }} />
                )}
              </div>
              <div className="pdf-watermark">EduStore · Aperçu gratuit</div>
            </div>

            {/* Locked pages indicator */}
            <div className="preview-locked">
              <div className="locked-icon">🔒</div>
              <div className="locked-text">
                <strong>
                  {lang === 'fr'
                    ? `${Math.max(0, (product.pages || 0) - previewCount)} pages supplémentaires`
                    : `${Math.max(0, (product.pages || 0) - previewCount)} صفحة إضافية`}
                </strong>
                <span>
                  {lang === 'fr' ? 'disponibles après achat' : 'متاحة بعد الشراء'}
                </span>
              </div>
              <button className="locked-buy" onClick={() => { setPreviewOpen(false); handleAddToCart(); }}>
                {lang === 'fr' ? `Acheter — ${product.price} TND` : `اشترِ — ${product.price} دينار`}
              </button>
            </div>

            {/* Prev / Next arrows */}
            <div className="preview-arrows">
              <button
                className="arrow-btn"
                disabled={previewPage === 0}
                onClick={() => setPreviewPage(p => p - 1)}
              >
                ←
              </button>
              <button
                className="arrow-btn"
                disabled={previewPage === previewCount - 1}
                onClick={() => setPreviewPage(p => p + 1)}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
