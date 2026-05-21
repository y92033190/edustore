import emailjs from '@emailjs/browser';

// ── Remplace par tes vraies clés EmailJS ──
const EMAILJS_SERVICE_ID  = 'service_c921xtw';   // EmailJS → Email Services → Service ID
const EMAILJS_TEMPLATE_ID = 'template_g4dp2fp';  // EmailJS → Email Templates → Template ID
const EMAILJS_PUBLIC_KEY  = 'ZPpj9e2n5v-TYQe-X'; // EmailJS → Account → Public Key

// Initialise EmailJS une seule fois
emailjs.init(EMAILJS_PUBLIC_KEY);

/**
 * Envoie le PDF par email au client après achat
 * @param {object} params
 * @param {string} params.clientName  - Nom du client
 * @param {string} params.clientEmail - Email du client
 * @param {Array}  params.items       - Produits achetés
 * @param {number} params.total       - Total payé
 * @param {string} params.payMethod   - Méthode de paiement
 */
export async function sendOrderEmail({ clientName, clientEmail, items, total, payMethod }) {
  // Envoie un email par produit acheté
  const promises = items.map(item => {
    const templateParams = {
      client_name:   clientName,
      client_email:  clientEmail,
      product_name:  item.title_fr,
      product_name_ar: item.title_ar || item.title_fr,
      price:         item.price,
      total:         total,
      pay_method:    payMethod,
      pdf_url:       item.pdf_url || '#',  // URL du PDF depuis Supabase Storage
      pages:         item.pages || 0,
      to_email:      clientEmail,
    };

    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
  });

  try {
    await Promise.all(promises);
    console.log('✅ Emails envoyés avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
}
