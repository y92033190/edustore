import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, deleteProduct, updateProduct, uploadPDF, getOrders, getClients, getDashboardStats } from '../lib/api';
import './Admin.css';

const MOCK_ACTIVITY = [
  { type: 'sale',    text_fr: 'Nouvelle vente — Cours maths S2',   text_ar: 'بيع جديد — درس رياضيات',    time: '5 min',  color: '#22c55e' },
  { type: 'user',    text_fr: 'Nouveau client — Sara M. inscrite',  text_ar: 'عميل جديد — سارة م.',       time: '12 min', color: '#4f8ef7' },
  { type: 'payment', text_fr: 'Paiement reçu — Flouci 15 TND',     text_ar: 'دفع مستلم — فلوسي 15 دينار',time: '28 min', color: '#22c55e' },
  { type: 'pending', text_fr: 'Commande en attente — Youssef K.',   text_ar: 'طلب معلق — يوسف ك.',        time: '1h',     color: '#f59e0b' },
  { type: 'upload',  text_fr: 'Nouveau contenu publié — Annales',   text_ar: 'محتوى جديد — امتحانات',     time: '2h',     color: '#4f8ef7' },
];

const COVER_COLORS = [
  { color: '#e8f0fe', accent: '#4f8ef7' },
  { color: '#fef3c7', accent: '#f59e0b' },
  { color: '#f0fdf4', accent: '#22c55e' },
  { color: '#fce7f3', accent: '#ec4899' },
  { color: '#ede9fe', accent: '#7c3aed' },
  { color: '#ecfdf5', accent: '#059669' },
];

export default function Admin() {
  const { lang } = useLang();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [section, setSection]       = useState('dashboard');
  const [products, setProducts]     = useState([]);
  const [orders, setOrders]         = useState([]);
  const [clients, setClients]       = useState([]);
  const [stats, setStats]           = useState({ totalProducts: 0, totalOrders: 0, paidOrders: 0, totalRevenue: 0, totalClients: 0 });
  const [loading, setLoading]       = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [published, setPublished]   = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [pdfFile, setPdfFile]       = useState(null);

  const [uploadForm, setUploadForm] = useState({
    title_fr: '', title_ar: '', subject_fr: '', subject_ar: '',
    description_fr: '', description_ar: '',
    price: '', pages: '', level: 'lycee', type: 'course',
  });

  // ── Load data on mount and section change ──
  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (section === 'orders') loadOrders();
    if (section === 'clients') loadClients();
  }, [section]);

  async function loadAll() {
    setLoading(true);
    try {
      const [prods, st] = await Promise.all([getProducts(), getDashboardStats()]);
      setProducts(prods);
      setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) { console.error(e); }
  }

  async function loadClients() {
    try {
      const data = await getClients();
      setClients(data);
    } catch (e) { console.error(e); }
  }

  // ── Publish new product ──
  const handlePublish = async () => {
    if (!uploadForm.title_fr || !uploadForm.price) {
      setPublishError(lang === 'fr' ? 'Titre FR et prix sont obligatoires.' : 'العنوان والسعر مطلوبان.');
      return;
    }
    setPublishing(true);
    setPublishError('');
    try {
      const colorPick = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
      const newProduct = {
        title_fr:       uploadForm.title_fr,
        title_ar:       uploadForm.title_ar || uploadForm.title_fr,
        subject_fr:     uploadForm.subject_fr || 'Général',
        subject_ar:     uploadForm.subject_ar || 'عام',
        description_fr: uploadForm.description_fr,
        description_ar: uploadForm.description_ar,
        level:          uploadForm.level,
        type:           uploadForm.type,
        price:          parseFloat(uploadForm.price) || 0,
        pages:          parseInt(uploadForm.pages) || 0,
        downloads:      0,
        preview_pages:  3,
        cover_color:    colorPick.color,
        cover_accent:   colorPick.accent,
        published:      true,
      };

      // 1. Save to Supabase
      const created = await createProduct(newProduct);

      // 2. Upload PDF if selected
      if (pdfFile && created?.id) {
        const pdfUrl = await uploadPDF(pdfFile, created.id);
        await updateProduct(created.id, { pdf_url: pdfUrl, pages: parseInt(uploadForm.pages) || 0 });
        created.pdf_url = pdfUrl;
      }

      // 3. Update local state
      setProducts(prev => [created, ...prev]);
      setStats(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
      setUploadForm({ title_fr: '', title_ar: '', subject_fr: '', subject_ar: '', description_fr: '', description_ar: '', price: '', pages: '', level: 'lycee', type: 'course' });
      setPdfFile(null);
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } catch (e) {
      setPublishError(lang === 'fr' ? 'Erreur lors de la publication. Vérifie Supabase.' : 'خطأ أثناء النشر. تحقق من Supabase.');
      console.error(e);
    } finally {
      setPublishing(false);
    }
  };

  // ── Delete product ──
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
    } catch (e) { console.error(e); }
    setDeleteConfirm(null);
  };

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);

  const statusInfo = {
    paid:      { fr: 'Payé',      ar: 'مدفوع', cls: 'badge-green' },
    pending:   { fr: 'En attente',ar: 'معلق',  cls: 'badge-amber' },
    cancelled: { fr: 'Annulé',    ar: 'ملغى',  cls: 'badge-red'   },
  };

  const levelLabels = { lycee: { fr: 'Lycée', ar: 'ثانوية' }, uni: { fr: 'Université', ar: 'جامعة' }, pro: { fr: 'Formation', ar: 'تكوين' } };
  const typeLabels  = { course: { fr: 'Cours', ar: 'درس' }, homework: { fr: 'Devoir', ar: 'واجب' }, project: { fr: 'Projet', ar: 'مشروع' }, exam: { fr: 'Annales', ar: 'امتحانات' } };
  const L = lang === 'fr' ? 'fr' : 'ar';

  const navItems = [
    { key: 'dashboard', icon: '▦', label_fr: 'Tableau de bord', label_ar: 'لوحة القيادة' },
    { key: 'contents',  icon: '📁', label_fr: 'Contenus',       label_ar: 'المحتوى'      },
    { key: 'orders',    icon: '🧾', label_fr: 'Commandes',      label_ar: 'الطلبات'      },
    { key: 'clients',   icon: '👥', label_fr: 'Clients',        label_ar: 'العملاء'      },
    { key: 'settings',  icon: '⚙',  label_fr: 'Paramètres',    label_ar: 'الإعدادات'    },
  ];

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
            <button key={item.key} className={`sidebar-item ${section === item.key ? 'active' : ''}`} onClick={() => setSection(item.key)}>
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
          <button className="sidebar-logout" onClick={async () => { await logout(); navigate('/login'); }} title={lang === 'fr' ? 'Déconnexion' : 'تسجيل الخروج'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
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

            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#e8f0fe', color: '#4f8ef7' }}>💰</div>
                <div className="metric-body">
                  <div className="metric-value">{stats.totalRevenue} TND</div>
                  <div className="metric-label">{lang === 'fr' ? 'Revenus' : 'الإيرادات'}</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>🛒</div>
                <div className="metric-body">
                  <div className="metric-value">{stats.paidOrders}</div>
                  <div className="metric-label">{lang === 'fr' ? 'Ventes payées' : 'مبيعات مدفوعة'}</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>📚</div>
                <div className="metric-body">
                  <div className="metric-value">{stats.totalProducts}</div>
                  <div className="metric-label">{lang === 'fr' ? 'Contenus publiés' : 'المحتوى المنشور'}</div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ background: '#fce7f3', color: '#ec4899' }}>👥</div>
                <div className="metric-body">
                  <div className="metric-value">{stats.totalClients}</div>
                  <div className="metric-label">{lang === 'fr' ? 'Clients' : 'العملاء'}</div>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dash-card">
                <div className="dash-card-head">
                  <h3>{lang === 'fr' ? 'Contenus récents' : 'المحتوى الأخير'}</h3>
                  <button className="text-btn" onClick={() => setSection('contents')}>{lang === 'fr' ? 'Gérer →' : 'إدارة →'}</button>
                </div>
                {loading ? (
                  <div style={{ color: 'var(--text2)', fontSize: 13 }}>{lang === 'fr' ? 'Chargement...' : 'جارٍ التحميل...'}</div>
                ) : (
                  <table className="admin-table">
                    <thead><tr><th>{lang === 'fr' ? 'Titre' : 'العنوان'}</th><th>{lang === 'fr' ? 'Type' : 'النوع'}</th><th>{lang === 'fr' ? 'Prix' : 'السعر'}</th></tr></thead>
                    <tbody>
                      {products.slice(0, 5).map(p => (
                        <tr key={p.id}>
                          <td className="td-name">{lang === 'fr' ? p.title_fr : p.title_ar}</td>
                          <td><span className="badge badge-purple">{typeLabels[p.type]?.[L]}</span></td>
                          <td><strong>{p.price} TND</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="dash-right">
                <div className="dash-card">
                  <div className="dash-card-head"><h3>{lang === 'fr' ? 'Contenus populaires' : 'الأكثر مبيعاً'}</h3></div>
                  {[...products].sort((a,b) => (b.downloads||0)-(a.downloads||0)).slice(0,5).map(p => (
                    <div key={p.id} className="bar-row">
                      <span className="bar-label">{lang === 'fr' ? p.title_fr : p.title_ar}</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.min(100, ((p.downloads||0)/70)*100)}%` }}/></div>
                      <span className="bar-val">{p.downloads || 0}</span>
                    </div>
                  ))}
                </div>
                <div className="dash-card">
                  <div className="dash-card-head"><h3>{lang === 'fr' ? 'Activité récente' : 'النشاط الأخير'}</h3></div>
                  {MOCK_ACTIVITY.map((a, i) => (
                    <div key={i} className="activity-row">
                      <span className="activity-dot" style={{ background: a.color }}/>
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

              {/* PDF drop zone */}
              <label className="upload-zone" style={{ cursor: 'pointer' }}>
                <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setPdfFile(e.target.files[0])} />
                <span style={{ fontSize: 32 }}>📄</span>
                {pdfFile
                  ? <div style={{ color: '#22c55e', fontWeight: 600 }}>✓ {pdfFile.name}</div>
                  : <div>{lang === 'fr' ? 'Clique pour choisir le fichier PDF' : 'انقر لاختيار ملف PDF'}</div>
                }
                <div style={{ fontSize: 12, opacity: 0.6 }}>PDF uniquement · max 50MB</div>
              </label>

              <div className="form-grid">
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Titre français *' : 'العنوان بالفرنسية *'}</label>
                  <input type="text" placeholder="Ex: Cours de mathématiques S2" value={uploadForm.title_fr} onChange={e => setUploadForm({ ...uploadForm, title_fr: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Titre arabe' : 'العنوان بالعربية'}</label>
                  <input type="text" placeholder="مثال: درس رياضيات" dir="rtl" value={uploadForm.title_ar} onChange={e => setUploadForm({ ...uploadForm, title_ar: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Matière (FR)' : 'المادة (FR)'}</label>
                  <input type="text" placeholder="Ex: Mathématiques" value={uploadForm.subject_fr} onChange={e => setUploadForm({ ...uploadForm, subject_fr: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Matière (AR)' : 'المادة (AR)'}</label>
                  <input type="text" placeholder="مثال: رياضيات" dir="rtl" value={uploadForm.subject_ar} onChange={e => setUploadForm({ ...uploadForm, subject_ar: e.target.value })} />
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
                  <label>{lang === 'fr' ? 'Prix (TND) *' : 'السعر (دينار) *'}</label>
                  <input type="number" placeholder="0.00" min="0" value={uploadForm.price} onChange={e => setUploadForm({ ...uploadForm, price: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>{lang === 'fr' ? 'Nombre de pages' : 'عدد الصفحات'}</label>
                  <input type="number" placeholder="0" min="0" value={uploadForm.pages} onChange={e => setUploadForm({ ...uploadForm, pages: e.target.value })} />
                </div>
              </div>

              {published  && <div className="success-toast">✅ {lang === 'fr' ? 'Contenu publié ! Il apparaît maintenant sur le site.' : 'تم النشر! يظهر الآن على الموقع.'}</div>}
              {publishError && <div className="error-toast">❌ {publishError}</div>}

              <button className="btn-publish" onClick={handlePublish} disabled={publishing}>
                {publishing ? (lang === 'fr' ? '⏳ Publication...' : '⏳ جارٍ النشر...') : (lang === 'fr' ? '📤 Publier sur le site' : '📤 نشر على الموقع')}
              </button>
            </div>

            {/* Contents table */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>{lang === 'fr' ? 'Tous les contenus' : 'جميع المحتويات'}</h3>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{products.length} {lang === 'fr' ? 'total' : 'إجمالاً'}</span>
              </div>
              {loading ? (
                <div style={{ color: 'var(--text2)', fontSize: 13, padding: '16px 0' }}>{lang === 'fr' ? 'Chargement depuis Supabase...' : 'جارٍ التحميل من Supabase...'}</div>
              ) : products.length === 0 ? (
                <div style={{ color: 'var(--text2)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
                  {lang === 'fr' ? 'Aucun contenu encore. Ajoute ton premier cours ci-dessus !' : 'لا يوجد محتوى بعد. أضف أول درس أعلاه!'}
                </div>
              ) : (
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
                        <td><span className="badge badge-blue">{levelLabels[p.level]?.[L]}</span></td>
                        <td><span className="badge badge-purple">{typeLabels[p.type]?.[L]}</span></td>
                        <td><strong>{p.price} TND</strong></td>
                        <td>{p.downloads || 0}</td>
                        <td>
                          <div className="action-btns">
                            <button className="action-btn delete" onClick={() => setDeleteConfirm(p.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {section === 'orders' && (
          <div className="admin-section fade-in">
            <div className="section-head">
              <div>
                <h1 className="section-title">{lang === 'fr' ? 'Commandes' : 'الطلبات'}</h1>
                <p className="section-sub">{orders.length} {lang === 'fr' ? 'commandes' : 'طلب'}</p>
              </div>
            </div>
            <div className="filter-bar">
              {['all','paid','pending','cancelled'].map(f => (
                <button key={f} className={`pill-btn ${orderFilter === f ? 'active' : ''}`} onClick={() => setOrderFilter(f)}>
                  {f === 'all' && (lang === 'fr' ? 'Tout' : 'الكل')}
                  {f === 'paid' && (lang === 'fr' ? 'Payées' : 'مدفوعة')}
                  {f === 'pending' && (lang === 'fr' ? 'En attente' : 'معلقة')}
                  {f === 'cancelled' && (lang === 'fr' ? 'Annulées' : 'ملغاة')}
                </button>
              ))}
            </div>
            <div className="dash-card">
              {orders.length === 0 ? (
                <div style={{ color: 'var(--text2)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
                  {lang === 'fr' ? 'Aucune commande encore.' : 'لا توجد طلبات بعد.'}
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{lang === 'fr' ? 'Client' : 'العميل'}</th>
                      <th>{lang === 'fr' ? 'Email' : 'البريد'}</th>
                      <th>{lang === 'fr' ? 'Paiement' : 'الدفع'}</th>
                      <th>{lang === 'fr' ? 'Total' : 'المجموع'}</th>
                      <th>{lang === 'fr' ? 'Statut' : 'الحالة'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id}>
                        <td style={{ color: 'var(--text2)', fontSize: 11 }}>#{String(o.id).slice(0,8)}</td>
                        <td className="td-name">{o.client_name}</td>
                        <td className="td-product">{o.client_email}</td>
                        <td><span className="method-tag">{o.payment_method}</span></td>
                        <td><strong>{o.total} TND</strong></td>
                        <td><span className={`badge ${statusInfo[o.status]?.cls || 'badge-amber'}`}>{statusInfo[o.status]?.[L] || o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
              {clients.length === 0 ? (
                <div style={{ color: 'var(--text2)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
                  {lang === 'fr' ? 'Aucun client encore.' : 'لا يوجد عملاء بعد.'}
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === 'fr' ? 'Client' : 'العميل'}</th>
                      <th>{lang === 'fr' ? 'Email' : 'البريد'}</th>
                      <th>{lang === 'fr' ? 'Commandes' : 'الطلبات'}</th>
                      <th>{lang === 'fr' ? 'Total dépensé' : 'الإجمالي'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div className="client-row">
                            <div className="client-avatar">{c.name?.[0] || '?'}</div>
                            <span className="td-name">{c.name}</span>
                          </div>
                        </td>
                        <td className="td-product">{c.email}</td>
                        <td>{c.orders?.length || 0}</td>
                        <td><strong>{(c.orders || []).filter(o => o.status === 'paid').reduce((s, o) => s + (o.total || 0), 0)} TND</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                <div className="form-field"><label>Email</label><input type="email" defaultValue="contact@edustore.tn" /></div>
                <div className="form-field"><label>WhatsApp</label><input type="text" defaultValue="+216 XX XXX XXX" /></div>
              </div>
              <div className="dash-card">
                <h3 className="settings-group-title">{lang === 'fr' ? 'Méthodes de paiement actives' : 'طرق الدفع المفعّلة'}</h3>
                {['Flouci', 'D17', 'Virement bancaire', 'PayPal', 'Carte bancaire'].map(m => (
                  <div key={m} className="toggle-row">
                    <span>{m}</span>
                    <div className="toggle on" />
                  </div>
                ))}
              </div>
              <div className="dash-card">
                <h3 className="settings-group-title">Supabase</h3>
                <div className="info-box">
                  ✅ {lang === 'fr' ? 'Connecté — les données sont synchronisées en temps réel.' : 'متصل — البيانات متزامنة في الوقت الفعلي.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>{lang === 'fr' ? 'Supprimer ce contenu ?' : 'حذف هذا المحتوى؟'}</h3>
            <p>{lang === 'fr' ? 'Il sera retiré du site immédiatement.' : 'سيُزال من الموقع فوراً.'}</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>{lang === 'fr' ? 'Annuler' : 'إلغاء'}</button>
              <button className="btn-delete" onClick={() => handleDelete(deleteConfirm)}>{lang === 'fr' ? 'Supprimer' : 'حذف'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
