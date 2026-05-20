import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS } from '../lib/data';
import './Admin.css';

const MOCK_ORDERS = [
  { id: 1, client: 'Amine B.', product_fr: 'Cours maths S2', product_ar: 'درس رياضيات', price: 8, status: 'paid', method: 'Flouci', date: '2024-01-15' },
  { id: 2, client: 'Sara M.', product_fr: 'Devoir physique', product_ar: 'واجب فيزياء', price: 5, status: 'paid', method: 'D17', date: '2024-01-15' },
  { id: 3, client: 'Youssef K.', product_fr: 'Résumé droit', product_ar: 'ملخص قانون', price: 12, status: 'pending', method: 'Virement', date: '2024-01-14' },
  { id: 4, client: 'Fatma L.', product_fr: 'Projet info', product_ar: 'مشروع إعلامية', price: 15, status: 'paid', method: 'PayPal', date: '2024-01-14' },
  { id: 5, client: 'Mohamed R.', product_fr: 'Annales bac', product_ar: 'امتحانات بكالوريا', price: 10, status: 'cancelled', method: 'Carte', date: '2024-01-13' },
  { id: 6, client: 'Nour T.', product_fr: 'Formation Excel', product_ar: 'تكوين إكسل', price: 20, status: 'paid', method: 'Flouci', date: '2024-01-13' },
];

const MOCK_ACTIVITY = [
  { type: 'sale', text_fr: 'Nouvelle vente — Cours maths S2', text_ar: 'بيع جديد — درس رياضيات', time: '5 min', color: '#22c55e' },
  { type: 'user', text_fr: 'Nouveau client — Sara M. inscrite', text_ar: 'عميل جديد — سارة م.', time: '12 min', color: '#4f8ef7' },
  { type: 'payment', text_fr: 'Paiement reçu — Flouci 15 TND', text_ar: 'دفع مستلم — فلوسي 15 دينار', time: '28 min', color: '#22c55e' },
  { type: 'pending', text_fr: 'Commande en attente — Youssef K.', text_ar: 'طلب معلق — يوسف ك.', time: '1h', color: '#f59e0b' },
  { type: 'upload', text_fr: 'Nouveau contenu publié — Annales', text_ar: 'محتوى جديد — امتحانات', time: '2h', color: '#4f8ef7' },
];

const SECTIONS = ['dashboard', 'contents', 'orders', 'clients', 'settings'];

export default function Admin() {
  const { lang, t } = useLang();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [uploadForm, setUploadForm] = useState({ title_fr: '', title_ar: '', price: '', level: 'lycee', type: 'course' });
  const [products, setProducts] = useState(PRODUCTS);
  const [published, setPublished] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const revenue = MOCK_ORDERS.filter(o => o.status === 'paid').reduce((s, o) => s + o.price, 0);
  const totalSales = MOCK_ORDERS.filter(o => o.status === 'paid').length;

  const handlePublish = () => {
    if (!uploadForm.title_fr) return;
    const newProduct = {
      id: products.length + 1,
      title_fr: uploadForm.title_fr,
      title_ar: uploadForm.title_ar || uploadForm.title_fr,
      subject_fr: 'Général', subject_ar: 'عام',
      level: uploadForm.level,
      type: uploadForm.type,
      price: parseFloat(uploadForm.price) || 0,
      pages: 0, downloads: 0, preview_pages: 2,
      description_fr: '', description_ar: '',
      cover_color: '#e8f0fe', cover_accent: '#4f8ef7',
    };
    setProducts([newProduct, ...products]);
    setUploadForm({ title_fr: '', title_ar: '', price: '', level: 'lycee', type: 'course' });
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const filteredOrders = orderFilter === 'all'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(o => o.status === orderFilter);

  const navItems = [
    { key: 'dashboard', icon: '▦', label_fr: 'Tableau de bord', label_ar: 'لوحة القيادة' },
    { key: 'contents', icon: '📁', label_fr: 'Contenus', label_ar: 'المحتوى' },
    { key: 'orders', icon: '🧾', label_fr: 'Commandes', label_ar: 'الطلبات' },
    { key: 'clients', icon: '👥', label_fr: 'Clients', label_ar: 'العملاء' },
    { key: 'settings', icon: '⚙', label_fr: 'Paramètres', label_ar: 'الإعدادات' },
  ];

  const statusInfo = {
    paid:      { fr: 'Payé',     ar: 'مدفوع',   cls: 'badge-green' },
    pending:   { fr: 'En attente', ar: 'معلق',   cls: 'badge-amber' },
    cancelled: { fr: 'Annulé',   ar: 'ملغى',    cls: 'badge-red' },
  };

  const levelLabels = {
    lycee: { fr: 'Lycée', ar: 'ثانوية' },
    uni:   { fr: 'Université', ar: 'جامعة' },
    pro:   { fr: 'Formation', ar: 'تكوين' },
  };

  const typeLabels = {
    course:   { fr: 'Cours', ar: 'درس' },
    homework: { fr: 'Devoir', ar: 'واجب' },
    project:  { fr: 'Projet', ar: 'مشروع' },
    exam:     { fr: 'Annales', ar: 'امتحانات' },
  };

  return (
    <div className="admin-wrap">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">ES</span>
          <div>
            <div className="logo-name">EduStore</div>
            <div className="logo-role">{lang === 'fr' ? 'Administration' : 'الإدارة'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`sidebar-item ${section === item.key ? 'active' : ''}`}
              onClick={() => setSection(item.key)}
            >
              <span className="si-icon">{item.icon}</span>
              <div className="si-labels">
                <span className="si-fr">{item.label_fr}</span>
                <span className="si-ar">{item.label_ar}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <div className="admin-name">{user?.email?.split('@')[0] || 'Admin'}</div>
            <div className="admin-email">{user?.email || 'admin@edustore.tn'}</div>
          </div>
          <button
            className="sidebar-logout"
            onClick={async () => { await logout(); navigate('/login'); }}
            title={lang === 'fr' ? 'Déconnexion' : 'تسجيل الخروج'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">

        {/* ── DASHBOARD ── */}
        {section === 'dashboard' && (
          <div className="admin-section fade-in">
            <div className="section-head">
              <div>
                <h1 className="section-title">{lang === 'fr' ? 'Tableau de bord' : 'لوحة القيادة'}</h1>
                <p className="section-sub">{lang === 'fr' ? 'Vue d\'ensemble de votre activité' : 'نظرة عامة على نشاطك'}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#e8f0fe', color: '#4f8ef7' }}>💰</div>
                <div className="metric-body">
                  <div className="metric-value">{revenue} TND</div>
                  <div className="metric-label">{lang === 'fr' ? 'Revenus ce mois' : 'إيرادات الشهر'}</div>
                </div>
                <div className="metric-trend up">+18%</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>🛒</div>
                <div className="metric-body">
                  <div className="metric-value">{totalSales}</div>
                  <div className="metric-label">{lang === 'fr' ? 'Ventes totales' : 'إجمالي المبيعات'}</div>
                </div>
                <div className="metric-trend up">+24</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>📚</div>
                <div className="metric-body">
                  <div className="metric-value">{products.length}</div>
                  <div className="metric-label">{lang === 'fr' ? 'Contenus publiés' : 'المحتوى المنشور'}</div>
                </div>
                <div className="metric-trend neutral">3 new</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#fce7f3', color: '#ec4899' }}>👥</div>
                <div className="metric-body">
                  <div className="metric-value">213</div>
                  <div className="metric-label">{lang === 'fr' ? 'Clients actifs' : 'العملاء النشطون'}</div>
                </div>
                <div className="metric-trend up">+11</div>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Recent orders */}
              <div className="dash-card">
                <div className="dash-card-head">
                  <h3>{lang === 'fr' ? 'Dernières commandes' : 'آخر الطلبات'}</h3>
                  <button className="text-btn" onClick={() => setSection('orders')}>
                    {lang === 'fr' ? 'Voir tout →' : 'عرض الكل →'}
                  </button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === 'fr' ? 'Client' : 'العميل'}</th>
                      <th>{lang === 'fr' ? 'Contenu' : 'المحتوى'}</th>
                      <th>{lang === 'fr' ? 'Prix' : 'السعر'}</th>
                      <th>{lang === 'fr' ? 'Statut' : 'الحالة'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td className="td-name">{o.client}</td>
                        <td className="td-product">{lang === 'fr' ? o.product_fr : o.product_ar}</td>
                        <td><strong>{o.price} TND</strong></td>
                        <td><span className={`badge ${statusInfo[o.status].cls}`}>{statusInfo[o.status][lang === 'fr' ? 'fr' : 'ar']}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Popular + Activity */}
              <div className="dash-right">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>{lang === 'fr' ? 'Contenus populaires' : 'المحتوى الأكثر مبيعاً'}</h3>
                  </div>
                  {[...products].sort((a,b) => b.downloads - a.downloads).slice(0,5).map(p => (
                    <div key={p.id} className="bar-row">
                      <span className="bar-label">{lang === 'fr' ? p.title_fr : p.title_ar}</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${Math.min(100, (p.downloads / 70) * 100)}%` }}></div>
                      </div>
                      <span className="bar-val">{p.downloads}</span>
                    </div>
                  ))}
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>{lang === 'fr' ? 'Activité récente' : 'النشاط الأخير'}</h3>
                  </div>
                  {MOCK_ACTIVITY.map((a, i) => (
                    <div key={i} className="activity-row">
                      <span className="activity-dot" style={{ background: a.color }}></span>
                      <span className="activity-text">{lang === 'fr' ? a.text_fr : a.text_ar}</span>
                      <span className="activity-time">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENTS ── */}
        {section === 'contents' && (
          <div className="admin-section fade-in">
            <div className="section-head">
              <div>
                <h1 className="section-title">{lang === 'fr' ? 'Gestion des contenus' : 'إدارة المحتوى'}</h1>
                <p className="section-sub">{lang === 'fr' ? `${products.length} contenus publiés` : `${products.length} محتوى منشور`}</p>
              </div>
            </div>

            {/* Upload form */}
            <div className="upload-card">
              <h3 className="upload-title">{lang === 'fr' ? 'Ajouter un nouveau contenu' : 'إضافة محتوى جديد'}</h3>

              <div className="upload-zone">
                <span style={{ fontSize: 32 }}>📄</span>
                <div>{lang === 'fr' ? 'Glisser le PDF ici · ou cliquer pour choisir' : 'اسحب ملف PDF هنا · أو انقر للاختيار'}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>PDF uniquement · max 50MB</div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Titre (français)' : 'العنوان (فرنسي)'}</label>
                  <input
                    type="text"
                    placeholder="Ex: Cours de mathématiques S2"
                    value={uploadForm.title_fr}
                    onChange={e => setUploadForm({ ...uploadForm, title_fr: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Titre (arabe)' : 'العنوان (عربي)'}</label>
                  <input
                    type="text"
                    placeholder="مثال: درس رياضيات"
                    dir="rtl"
                    value={uploadForm.title_ar}
                    onChange={e => setUploadForm({ ...uploadForm, title_ar: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Niveau' : 'المستوى'}</label>
                  <select value={uploadForm.level} onChange={e => setUploadForm({ ...uploadForm, level: e.target.value })}>
                    <option value="lycee">{lang === 'fr' ? 'Lycée' : 'ثانوية'}</option>
                    <option value="uni">{lang === 'fr' ? 'Université' : 'جامعة'}</option>
                    <option value="pro">{lang === 'fr' ? 'Formation' : 'تكوين'}</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Type' : 'النوع'}</label>
                  <select value={uploadForm.type} onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}>
                    <option value="course">{lang === 'fr' ? 'Cours' : 'درس'}</option>
                    <option value="homework">{lang === 'fr' ? 'Devoir' : 'واجب'}</option>
                    <option value="project">{lang === 'fr' ? 'Projet' : 'مشروع'}</option>
                    <option value="exam">{lang === 'fr' ? 'Annales' : 'امتحانات'}</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Prix (TND)' : 'السعر (دينار)'}</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    value={uploadForm.price}
                    onChange={e => setUploadForm({ ...uploadForm, price: e.target.value })}
                  />
                </div>
              </div>

              {published && (
                <div className="success-toast">
                  ✅ {lang === 'fr' ? 'Contenu publié avec succès !' : 'تم نشر المحتوى بنجاح!'}
                </div>
              )}

              <button className="btn-publish" onClick={handlePublish}>
                {lang === 'fr' ? '📤 Publier le contenu' : '📤 نشر المحتوى'}
              </button>
            </div>

            {/* Contents table */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>{lang === 'fr' ? 'Tous les contenus' : 'جميع المحتويات'}</h3>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{lang === 'fr' ? 'Titre' : 'العنوان'}</th>
                    <th>{lang === 'fr' ? 'Niveau' : 'المستوى'}</th>
                    <th>{lang === 'fr' ? 'Type' : 'النوع'}</th>
                    <th>{lang === 'fr' ? 'Prix' : 'السعر'}</th>
                    <th>{lang === 'fr' ? 'Ventes' : 'المبيعات'}</th>
                    <th>{lang === 'fr' ? 'Actions' : 'إجراءات'}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="td-name">{lang === 'fr' ? p.title_fr : p.title_ar}</td>
                      <td><span className="badge badge-blue">{levelLabels[p.level]?.[lang === 'fr' ? 'fr' : 'ar']}</span></td>
                      <td><span className="badge badge-purple">{typeLabels[p.type]?.[lang === 'fr' ? 'fr' : 'ar']}</span></td>
                      <td><strong>{p.price} TND</strong></td>
                      <td>{p.downloads}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn edit">✏️</button>
                          <button className="action-btn delete" onClick={() => setDeleteConfirm(p.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {section === 'orders' && (
          <div className="admin-section fade-in">
            <div className="section-head">
              <div>
                <h1 className="section-title">{lang === 'fr' ? 'Commandes' : 'الطلبات'}</h1>
                <p className="section-sub">{lang === 'fr' ? `${MOCK_ORDERS.length} commandes au total` : `${MOCK_ORDERS.length} طلب إجمالاً`}</p>
              </div>
            </div>

            <div className="filter-bar">
              {['all', 'paid', 'pending', 'cancelled'].map(f => (
                <button
                  key={f}
                  className={`pill-btn ${orderFilter === f ? 'active' : ''}`}
                  onClick={() => setOrderFilter(f)}
                >
                  {f === 'all' && (lang === 'fr' ? 'Tout' : 'الكل')}
                  {f === 'paid' && (lang === 'fr' ? 'Payées' : 'مدفوعة')}
                  {f === 'pending' && (lang === 'fr' ? 'En attente' : 'معلقة')}
                  {f === 'cancelled' && (lang === 'fr' ? 'Annulées' : 'ملغاة')}
                </button>
              ))}
            </div>

            <div className="dash-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{lang === 'fr' ? 'Client' : 'العميل'}</th>
                    <th>{lang === 'fr' ? 'Produit' : 'المنتج'}</th>
                    <th>{lang === 'fr' ? 'Paiement' : 'الدفع'}</th>
                    <th>{lang === 'fr' ? 'Prix' : 'السعر'}</th>
                    <th>{lang === 'fr' ? 'Date' : 'التاريخ'}</th>
                    <th>{lang === 'fr' ? 'Statut' : 'الحالة'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{ color: 'var(--text2)', fontSize: 12 }}>#{o.id}</td>
                      <td className="td-name">{o.client}</td>
                      <td className="td-product">{lang === 'fr' ? o.product_fr : o.product_ar}</td>
                      <td><span className="method-tag">{o.method}</span></td>
                      <td><strong>{o.price} TND</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{o.date}</td>
                      <td><span className={`badge ${statusInfo[o.status].cls}`}>{statusInfo[o.status][lang === 'fr' ? 'fr' : 'ar']}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CLIENTS ── */}
        {section === 'clients' && (
          <div className="admin-section fade-in">
            <div className="section-head">
              <h1 className="section-title">{lang === 'fr' ? 'Clients' : 'العملاء'}</h1>
            </div>
            <div className="dash-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{lang === 'fr' ? 'Client' : 'العميل'}</th>
                    <th>{lang === 'fr' ? 'Achats' : 'المشتريات'}</th>
                    <th>{lang === 'fr' ? 'Total dépensé' : 'الإجمالي'}</th>
                    <th>{lang === 'fr' ? 'Méthode préférée' : 'طريقة الدفع'}</th>
                    <th>{lang === 'fr' ? 'Dernier achat' : 'آخر شراء'}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Amine B.', orders: 3, total: 23, method: 'Flouci', last: '2024-01-15' },
                    { name: 'Sara M.', orders: 2, total: 17, method: 'D17', last: '2024-01-15' },
                    { name: 'Youssef K.', orders: 1, total: 12, method: 'Virement', last: '2024-01-14' },
                    { name: 'Fatma L.', orders: 4, total: 45, method: 'PayPal', last: '2024-01-14' },
                    { name: 'Nour T.', orders: 2, total: 28, method: 'Flouci', last: '2024-01-13' },
                  ].map(c => (
                    <tr key={c.name}>
                      <td>
                        <div className="client-row">
                          <div className="client-avatar">{c.name[0]}</div>
                          <span className="td-name">{c.name}</span>
                        </div>
                      </td>
                      <td>{c.orders} {lang === 'fr' ? 'achats' : 'مشتريات'}</td>
                      <td><strong>{c.total} TND</strong></td>
                      <td><span className="method-tag">{c.method}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{c.last}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {section === 'settings' && (
          <div className="admin-section fade-in">
            <div className="section-head">
              <h1 className="section-title">{lang === 'fr' ? 'Paramètres' : 'الإعدادات'}</h1>
            </div>
            <div className="settings-grid">
              <div className="dash-card">
                <h3 className="settings-group-title">{lang === 'fr' ? 'Informations du site' : 'معلومات الموقع'}</h3>
                <div className="form-field"><label>{lang === 'fr' ? 'Nom du site' : 'اسم الموقع'}</label><input type="text" defaultValue="EduStore" /></div>
                <div className="form-field"><label>{lang === 'fr' ? 'Email de contact' : 'البريد الإلكتروني'}</label><input type="email" defaultValue="contact@edustore.tn" /></div>
                <div className="form-field"><label>{lang === 'fr' ? 'WhatsApp' : 'واتساب'}</label><input type="text" defaultValue="+216 XX XXX XXX" /></div>
              </div>
              <div className="dash-card">
                <h3 className="settings-group-title">{lang === 'fr' ? 'Méthodes de paiement' : 'طرق الدفع'}</h3>
                {['Flouci', 'D17', 'Virement bancaire', 'PayPal', 'Carte bancaire'].map(m => (
                  <div key={m} className="toggle-row">
                    <span>{m}</span>
                    <div className="toggle on"></div>
                  </div>
                ))}
              </div>
              <div className="dash-card">
                <h3 className="settings-group-title">{lang === 'fr' ? 'Supabase (base de données)' : 'Supabase (قاعدة البيانات)'}</h3>
                <div className="form-field"><label>URL</label><input type="text" placeholder="https://xxx.supabase.co" /></div>
                <div className="form-field"><label>Anon Key</label><input type="password" placeholder="eyJhbGciOiJ..." /></div>
                <div className="info-box">
                  💡 {lang === 'fr'
                    ? 'Ces clés sont dans ton projet Supabase → Settings → API'
                    : 'هذه المفاتيح في مشروع Supabase ← الإعدادات ← API'}
                </div>
              </div>
            </div>
            <button className="btn-publish" style={{ marginTop: 24 }}>
              {lang === 'fr' ? '💾 Sauvegarder' : '💾 حفظ'}
            </button>
          </div>
        )}
      </main>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>{lang === 'fr' ? 'Supprimer ce contenu ?' : 'حذف هذا المحتوى؟'}</h3>
            <p>{lang === 'fr' ? 'Cette action est irréversible.' : 'هذا الإجراء لا يمكن التراجع عنه.'}</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                {lang === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>
              <button className="btn-delete" onClick={() => handleDelete(deleteConfirm)}>
                {lang === 'fr' ? 'Supprimer' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
