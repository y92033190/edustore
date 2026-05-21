import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../lib/api';
import { sendOrderEmail } from '../lib/email';
import './Cart.css';

// ── Config — remplace par tes vraies infos ──
const CONFIG = {
  whatsapp:      '+21629936491',        // ton numéro WhatsApp
  konnect_url:   'https://app.konnect.network/payment-gateway', // URL Konnect
  konnect_key:   'TON_API_KEY_KONNECT', // clé API Konnect
  paypal_email:  '7waza.contact@email.com',       // email PayPal
};

const PAYMENT_METHODS = [
  {
    key: 'whatsapp',
    icon: '💬',
    label_fr: 'WhatsApp',
    label_ar: 'واتساب',
    info_fr: 'Confirmation manuelle par WhatsApp',
    info_ar: 'تأكيد يدوي عبر واتساب',
    badge_fr: 'Manuel',
    badge_ar: 'يدوي',
    badge_color: '#f59e0b',
  },
  {
    key: 'konnect',
    icon: '🏦',
    label_fr: 'Konnect',
    label_ar: 'كونكت',
    info_fr: 'Paiement en ligne tunisien — Carte / D17 / Flouci',
    info_ar: 'دفع إلكتروني تونسي — بطاقة / D17 / فلوسي',
    badge_fr: 'Recommandé',
    badge_ar: 'موصى به',
    badge_color: '#22c55e',
  },
  {
    key: 'paypal',
    icon: '🌐',
    label_fr: 'PayPal',
    label_ar: 'باي بال',
    info_fr: 'Paiement international sécurisé',
    info_ar: 'دفع دولي آمن',
    badge_fr: 'International',
    badge_ar: 'دولي',
    badge_color: '#4f8ef7',
  },
  {
    key: 'transfer',
    icon: '🏧',
    label_fr: 'Virement bancaire',
    label_ar: 'تحويل بنكي',
    info_fr: 'RIB envoyé après confirmation',
    info_ar: 'رقم الحساب يُرسل بعد التأكيد',
    badge_fr: 'Manuel',
    badge_ar: 'يدوي',
    badge_color: '#7c3aed',
  },
];

export default function Cart() {
  const { lang, t } = useLang();
  const { items, remove, total, clear } = useCart();

  const [payMethod, setPayMethod]     = useState('');
  const [clientName, setClientName]   = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [step, setStep]               = useState('cart'); // cart | processing | success | whatsapp | transfer

  const L = lang === 'fr' ? 'fr' : 'ar';

  const validate = () => {
    if (!clientName)  { setError(lang === 'fr' ? 'Veuillez entrer votre nom.'   : 'يرجى إدخال اسمك.'); return false; }
    if (!clientEmail) { setError(lang === 'fr' ? 'Veuillez entrer votre email.' : 'يرجى إدخال بريدك.'); return false; }
    if (!payMethod)   { setError(lang === 'fr' ? 'Choisissez une méthode de paiement.' : 'اختر طريقة دفع.'); return false; }
    return true;
  };

  // ── Sauvegarde la commande dans Supabase + envoie email ──
  const saveOrder = async (status = 'pending') => {
    try {
      await createOrder({ clientName, clientEmail, items, paymentMethod: payMethod, total });
    } catch (e) {
      console.error('Order save error:', e);
    }
    // Envoie le PDF par email au client
    await sendOrderEmail({ clientName, clientEmail, items, total, payMethod });
  };

  // ── WhatsApp ──
  const handleWhatsApp = async () => {
    if (!validate()) return;
    setLoading(true);
    await saveOrder('pending');
    const productsList = items.map(i => `• ${lang === 'fr' ? i.title_fr : i.title_ar} (${i.price} TND)`).join('\n');
    const message = encodeURIComponent(
      `🎓 *Nouvelle commande EduStore*\n\n` +
      `👤 Nom : ${clientName}\n` +
      `📧 Email : ${clientEmail}\n\n` +
      `📦 Produits :\n${productsList}\n\n` +
      `💰 Total : ${total} TND\n` +
      `💳 Paiement : WhatsApp\n\n` +
      `Merci de confirmer ma commande !`
    );
    window.open(`https://wa.me/${CONFIG.whatsapp.replace(/\s/g, '')}?text=${message}`, '_blank');
    clear();
    setStep('whatsapp');
    setLoading(false);
  };

  // ── Konnect ──
  const handleKonnect = async () => {
    if (!validate()) return;
    setLoading(true);
    setStep('processing');
    await saveOrder('pending');
    // Konnect : redirige vers la page de paiement avec les paramètres
    const params = new URLSearchParams({
      amount:       total * 1000, // en millimes
      currency:     'TND',
      description:  `EduStore — ${items.length} article(s)`,
      email:        clientEmail,
      firstName:    clientName.split(' ')[0] || clientName,
      lastName:     clientName.split(' ').slice(1).join(' ') || '',
      successUrl:   `${window.location.origin}/?payment=success`,
      failUrl:      `${window.location.origin}/cart?payment=failed`,
    });
    window.location.href = `${CONFIG.konnect_url}?${params.toString()}`;
  };

  // ── PayPal ──
  const handlePayPal = async () => {
    if (!validate()) return;
    setLoading(true);
    await saveOrder('pending');
    const description = encodeURIComponent(`EduStore — ${items.map(i => i.title_fr).join(', ')}`);
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${CONFIG.paypal_email}&amount=${total}&currency_code=USD&item_name=${description}&return=${encodeURIComponent(window.location.origin + '/?payment=success')}&cancel_return=${encodeURIComponent(window.location.origin + '/cart')}`;
    window.open(paypalUrl, '_blank');
    clear();
    setStep('success');
    setLoading(false);
  };

  // ── Virement ──
  const handleTransfer = async () => {
    if (!validate()) return;
    setLoading(true);
    await saveOrder('pending');
    clear();
    setStep('transfer');
    setLoading(false);
  };

  const handleOrder = async () => {
    setError('');
    if (payMethod === 'whatsapp')  return handleWhatsApp();
    if (payMethod === 'konnect')   return handleKonnect();
    if (payMethod === 'paypal')    return handlePayPal();
    if (payMethod === 'transfer')  return handleTransfer();
  };

  // ── Écrans de confirmation ──
  if (step === 'whatsapp') return (
    <div className="cart-page"><div className="container">
      <div className="confirm-box">
        <div className="confirm-icon">💬</div>
        <h2>{lang === 'fr' ? 'Redirection WhatsApp !' : 'تم فتح واتساب!'}</h2>
        <p>{lang === 'fr' ? 'Un message pré-rempli a été ouvert dans WhatsApp. Envoie-le pour confirmer ta commande.' : 'تم فتح رسالة جاهزة في واتساب. أرسلها لتأكيد طلبك.'}</p>
        <div className="confirm-steps">
          <div className="cs-step"><span>1</span>{lang === 'fr' ? 'Envoie le message WhatsApp' : 'أرسل رسالة واتساب'}</div>
          <div className="cs-step"><span>2</span>{lang === 'fr' ? 'On confirme et envoie le PDF' : 'نؤكد ونرسل ملف PDF'}</div>
          <div className="cs-step"><span>3</span>{lang === 'fr' ? 'Tu reçois par email' : 'تستلم عبر البريد'}</div>
        </div>
        <Link to="/catalog" className="confirm-btn">{lang === 'fr' ? 'Continuer les achats' : 'متابعة التسوق'}</Link>
      </div>
    </div></div>
  );

  if (step === 'transfer') return (
    <div className="cart-page"><div className="container">
      <div className="confirm-box">
        <div className="confirm-icon">🏧</div>
        <h2>{lang === 'fr' ? 'Commande enregistrée !' : 'تم تسجيل الطلب!'}</h2>
        <p>{lang === 'fr' ? 'Effectue le virement et envoie le reçu par WhatsApp ou email.' : 'قم بالتحويل وأرسل الإيصال عبر واتساب أو البريد.'}</p>
        <div className="rib-box">
          <div className="rib-row"><span>{lang === 'fr' ? 'Banque' : 'البنك'}</span><strong>STB / BNA / BIAT</strong></div>
          <div className="rib-row"><span>RIB</span><strong>XX XXX XXXX XXXX XXXX XXXX XXX</strong></div>
          <div className="rib-row"><span>{lang === 'fr' ? 'Montant' : 'المبلغ'}</span><strong style={{ color: '#22c55e' }}>{total} TND</strong></div>
          <div className="rib-row"><span>{lang === 'fr' ? 'Référence' : 'المرجع'}</span><strong>{clientName}</strong></div>
        </div>
        <a href={`https://wa.me/${CONFIG.whatsapp.replace(/\s/g, '')}`} target="_blank" rel="noreferrer" className="confirm-btn whatsapp-btn">
          💬 {lang === 'fr' ? 'Envoyer le reçu sur WhatsApp' : 'أرسل الإيصال عبر واتساب'}
        </a>
      </div>
    </div></div>
  );

  if (step === 'success') return (
    <div className="cart-page"><div className="container">
      <div className="confirm-box">
        <div className="confirm-icon">✅</div>
        <h2>{lang === 'fr' ? 'Paiement en cours !' : 'جارٍ الدفع!'}</h2>
        <p>{lang === 'fr' ? 'Tu seras redirigé vers PayPal. Une fois le paiement confirmé, tu recevras tes PDF par email.' : 'ستُحوَّل إلى PayPal. بعد تأكيد الدفع ستستلم ملفات PDF عبر البريد.'}</p>
        <Link to="/catalog" className="confirm-btn">{lang === 'fr' ? 'Retour au catalogue' : 'العودة للكتالوج'}</Link>
      </div>
    </div></div>
  );

  if (step === 'processing') return (
    <div className="cart-page"><div className="container">
      <div className="confirm-box">
        <div className="confirm-icon" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
        <h2>{lang === 'fr' ? 'Redirection vers Konnect...' : 'جارٍ التوجيه إلى Konnect...'}</h2>
        <p>{lang === 'fr' ? 'Tu vas être redirigé vers la page de paiement sécurisée.' : 'ستُوجَّه إلى صفحة الدفع الآمنة.'}</p>
      </div>
    </div></div>
  );

  // ── Page panier principale ──
  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">{t.cart.title}</h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <p>{t.cart.empty}</p>
            <Link to="/catalog" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>
              {lang === 'fr' ? '← Voir le catalogue' : '← عرض الكتالوج'}
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Articles */}
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="ci-cover" style={{ background: item.cover_color }}>
                    {item.type === 'course'   && '📖'}
                    {item.type === 'homework' && '✏️'}
                    {item.type === 'project'  && '💻'}
                    {item.type === 'exam'     && '📝'}
                  </div>
                  <div className="ci-info">
                    <div className="ci-title">{lang === 'fr' ? item.title_fr : item.title_ar}</div>
                    <div className="ci-meta">{lang === 'fr' ? item.subject_fr : item.subject_ar} · {item.pages} {t.catalog.pages}</div>
                  </div>
                  <div className="ci-price">{item.price} TND</div>
                  <button className="ci-remove" onClick={() => remove(item.id)}>✕</button>
                </div>
              ))}

              {/* Infos client */}
              <div className="client-form">
                <h3>{lang === 'fr' ? 'Vos coordonnées' : 'معلوماتك'}</h3>
                <div className="client-fields">
                  <div className="form-field">
                    <label>{lang === 'fr' ? 'Nom complet' : 'الاسم الكامل'}</label>
                    <input type="text" placeholder={lang === 'fr' ? 'Mohamed Ben Ali' : 'محمد بن علي'} value={clientName} onChange={e => setClientName(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input type="email" placeholder="email@exemple.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="cart-sidebar">
              <div className="order-summary">
                <h3>{lang === 'fr' ? 'Récapitulatif' : 'ملخص الطلب'}</h3>
                <div className="summary-row">
                  <span>{items.length} {lang === 'fr' ? 'article(s)' : 'عنصر'}</span>
                  <span>{total} TND</span>
                </div>
                <div className="summary-total">
                  <span>{t.cart.total}</span>
                  <span>{total} TND</span>
                </div>
              </div>

              {/* Méthodes de paiement */}
              <div className="payment-section">
                <h3>{lang === 'fr' ? 'Méthode de paiement' : 'طريقة الدفع'}</h3>
                <div className="payment-list">
                  {PAYMENT_METHODS.map(m => (
                    <label key={m.key} className={`payment-option ${payMethod === m.key ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value={m.key} checked={payMethod === m.key} onChange={() => setPayMethod(m.key)} />
                      <span className="pm-icon">{m.icon}</span>
                      <div className="pm-info">
                        <div className="pm-name">
                          {m[`label_${L}`]}
                          <span className="pm-badge" style={{ background: m.badge_color + '22', color: m.badge_color }}>
                            {m[`badge_${L}`]}
                          </span>
                        </div>
                        <div className="pm-desc">{m[`info_${L}`]}</div>
                      </div>
                      {payMethod === m.key && <span className="pm-check">✓</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Infos selon la méthode choisie */}
              {payMethod === 'whatsapp' && (
                <div className="method-info whatsapp">
                  💬 {lang === 'fr'
                    ? `Un message sera envoyé au ${CONFIG.whatsapp}. On confirme sous 24h.`
                    : `ستُرسل رسالة إلى ${CONFIG.whatsapp}. نؤكد خلال 24 ساعة.`}
                </div>
              )}
              {payMethod === 'konnect' && (
                <div className="method-info konnect">
                  🏦 {lang === 'fr'
                    ? 'Tu seras redirigé vers Konnect pour payer par carte, D17 ou Flouci.'
                    : 'ستُوجَّه إلى Konnect للدفع ببطاقة أو D17 أو فلوسي.'}
                </div>
              )}
              {payMethod === 'paypal' && (
                <div className="method-info paypal">
                  🌐 {lang === 'fr'
                    ? 'Tu seras redirigé vers PayPal pour finaliser le paiement.'
                    : 'ستُوجَّه إلى PayPal لإتمام الدفع.'}
                </div>
              )}
              {payMethod === 'transfer' && (
                <div className="method-info transfer">
                  🏧 {lang === 'fr'
                    ? 'Les coordonnées bancaires seront affichées après confirmation.'
                    : 'ستظهر بيانات الحساب البنكي بعد التأكيد.'}
                </div>
              )}

              {error && <div className="error-msg">⚠️ {error}</div>}

              <button className={`btn-checkout ${(!payMethod || loading) ? 'disabled' : ''}`} onClick={handleOrder} disabled={!payMethod || loading}>
                {loading
                  ? (lang === 'fr' ? '⏳ Traitement...' : '⏳ جارٍ المعالجة...')
                  : payMethod === 'whatsapp' ? `💬 ${lang === 'fr' ? 'Commander via WhatsApp' : 'اطلب عبر واتساب'}`
                  : payMethod === 'konnect'  ? `🏦 ${lang === 'fr' ? 'Payer avec Konnect' : 'ادفع مع Konnect'}`
                  : payMethod === 'paypal'   ? `🌐 ${lang === 'fr' ? 'Payer avec PayPal' : 'ادفع مع PayPal'}`
                  : payMethod === 'transfer' ? `🏧 ${lang === 'fr' ? 'Confirmer la commande' : 'تأكيد الطلب'}`
                  : `${t.payment.confirm} — ${total} TND`}
              </button>

              <div className="purchase-guarantee" style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)', display: 'flex', gap: 6 }}>
                <span>🔒</span>
                {lang === 'fr' ? 'PDF livré après confirmation du paiement' : 'يُسلَّم PDF بعد تأكيد الدفع'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
