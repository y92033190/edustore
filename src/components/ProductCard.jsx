import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { lang, t } = useLang();
  const { add, items } = useCart();

  const title = lang === 'fr' ? product.title_fr : product.title_ar;
  const subject = lang === 'fr' ? product.subject_fr : product.subject_ar;
  const inCart = items.find(i => i.id === product.id);

  const typeLabels = {
    course: { fr: 'Cours', ar: 'درس' },
    homework: { fr: 'Devoir', ar: 'واجب' },
    project: { fr: 'Projet', ar: 'مشروع' },
    exam: { fr: 'Annales', ar: 'امتحانات' },
  };

  const levelLabels = {
    lycee: { fr: 'Lycée', ar: 'ثانوية' },
    uni: { fr: 'Université', ar: 'جامعة' },
    pro: { fr: 'Formation', ar: 'تكوين' },
  };

  return (
    <div className="product-card fade-up">
      <Link to={`/product/${product.id}`} className="card-cover" style={{ background: product.cover_color }}>
        <div className="cover-icon" style={{ color: product.cover_accent }}>
          {product.type === 'course' && '📖'}
          {product.type === 'homework' && '✏️'}
          {product.type === 'project' && '💻'}
          {product.type === 'exam' && '📝'}
        </div>
        <div className="cover-pages" style={{ color: product.cover_accent }}>
          {product.pages} {t.catalog.pages}
        </div>
        <div className="cover-badge" style={{ background: product.cover_accent }}>
          {typeLabels[product.type]?.[lang]}
        </div>
      </Link>

      <div className="card-body">
        <div className="card-meta">
          <span className="card-subject">{subject}</span>
          <span className="card-level">{levelLabels[product.level]?.[lang]}</span>
        </div>
        <Link to={`/product/${product.id}`} className="card-title">{title}</Link>
        <div className="card-footer">
          <span className="card-price">{product.price} <small>{t.catalog.tnd}</small></span>
          <div className="card-actions">
            <Link to={`/product/${product.id}`} className="btn-preview">
              {t.catalog.preview}
            </Link>
            <button
              className={`btn-buy ${inCart ? 'in-cart' : ''}`}
              onClick={() => add(product)}
              disabled={inCart}
            >
              {inCart ? '✓' : t.catalog.buy}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
