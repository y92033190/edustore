import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { lang, t, toggle } = useLang();
  const { count } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">EduStore</span>
          <span className="logo-ar">متجر التعليم</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            {t.nav.home}
          </Link>
          <Link to="/catalog" className={`nav-link ${isActive('/catalog') ? 'active' : ''}`}>
            {t.nav.catalog}
          </Link>
        </div>

        <div className="navbar-actions">
          <button className="lang-toggle" onClick={toggle}>
            <span className={lang === 'fr' ? 'active' : ''}>FR</span>
            <span className="divider">|</span>
            <span className={lang === 'ar' ? 'active' : ''}>عربي</span>
          </button>

          <Link to="/cart" className="cart-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>

          {user ? (
            <div className="admin-user">
              <Link to="/admin" className="admin-btn">{t.nav.admin}</Link>
              <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <Link to="/login" className="admin-btn">{t.nav.admin}</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
