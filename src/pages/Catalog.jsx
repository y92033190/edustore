import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { getProducts } from '../lib/api';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

export default function Catalog() {
  const { lang, t } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [level, setLevel]       = useState('all');
  const [type, setType]         = useState('all');
  const [sort, setSort]         = useState('popular');
  const [search, setSearch]     = useState('');

  useEffect(() => { loadProducts(); }, [level, type, search]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getProducts({ level, type, search });
      setProducts(data);
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const sorted = [...products].sort((a, b) => {
    if (sort === 'popular') return (b.downloads || 0) - (a.downloads || 0);
    if (sort === 'price')   return a.price - b.price;
    return 0;
  });

  const levels = [
    { key: 'all',   fr: 'Tout',       ar: 'الكل'   },
    { key: 'lycee', fr: 'Lycée',      ar: 'ثانوية'  },
    { key: 'uni',   fr: 'Université', ar: 'جامعة'   },
    { key: 'pro',   fr: 'Formation',  ar: 'تكوين'   },
  ];

  const types = [
    { key: 'all',      fr: 'Tout',    ar: 'الكل'      },
    { key: 'course',   fr: 'Cours',   ar: 'درس'       },
    { key: 'homework', fr: 'Devoir',  ar: 'واجب'      },
    { key: 'project',  fr: 'Projet',  ar: 'مشروع'     },
    { key: 'exam',     fr: 'Annales', ar: 'امتحانات'  },
  ];

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <div>
            <h1 className="catalog-title">{t.catalog.title}</h1>
            <p className="catalog-subtitle">{t.catalog.subtitle}</p>
          </div>
          <input
            className="search-input"
            placeholder={lang === 'fr' ? 'Rechercher...' : 'بحث...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="catalog-filters">
          <div className="filter-group">
            <label className="filter-label">{lang === 'fr' ? 'Niveau' : 'المستوى'}</label>
            <div className="filter-pills">
              {levels.map(l => (
                <button key={l.key} className={`pill ${level === l.key ? 'active' : ''}`} onClick={() => setLevel(l.key)}>
                  {l[lang]}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">{lang === 'fr' ? 'Type' : 'النوع'}</label>
            <div className="filter-pills">
              {types.map(tp => (
                <button key={tp.key} className={`pill ${type === tp.key ? 'active' : ''}`} onClick={() => setType(tp.key)}>
                  {tp[lang]}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group filter-sort">
            <label className="filter-label">{lang === 'fr' ? 'Trier' : 'ترتيب'}</label>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">{t.catalog.sort_popular}</option>
              <option value="recent">{t.catalog.sort_recent}</option>
              <option value="price">{t.catalog.sort_price}</option>
            </select>
          </div>
        </div>

        <div className="catalog-count">
          {loading
            ? (lang === 'fr' ? 'Chargement...' : 'جارٍ التحميل...')
            : `${sorted.length} ${lang === 'fr' ? 'résultat(s)' : 'نتيجة'}`}
        </div>

        {loading ? (
          <div className="products-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>{lang === 'fr' ? 'Aucun résultat trouvé' : 'لا توجد نتائج'}</p>
          </div>
        ) : (
          <div className="products-grid">
            {sorted.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
