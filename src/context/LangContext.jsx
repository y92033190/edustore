import { createContext, useContext, useState } from 'react';

const translations = {
  fr: {
    dir: 'ltr',
    nav: {
      home: 'Accueil',
      catalog: 'Catalogue',
      login: 'Connexion',
      admin: 'Admin',
    },
    hero: {
      title: 'Cours & devoirs\npour réussir',
      subtitle: 'Des ressources PDF de qualité pour tous les niveaux — lycée, université et formation professionnelle.',
      cta: 'Voir le catalogue',
      cta2: 'En savoir plus',
    },
    stats: {
      courses: 'Cours disponibles',
      students: 'Étudiants satisfaits',
      subjects: 'Matières couvertes',
    },
    catalog: {
      title: 'Catalogue',
      subtitle: 'Trouvez les ressources qu\'il vous faut',
      filter_all: 'Tout',
      filter_lycee: 'Lycée',
      filter_uni: 'Université',
      filter_pro: 'Formation',
      sort_popular: 'Populaires',
      sort_recent: 'Récents',
      sort_price: 'Prix',
      buy: 'Acheter',
      preview: 'Aperçu',
      pages: 'pages',
      tnd: 'TND',
    },
    product: {
      preview: 'Aperçu gratuit',
      buy: 'Acheter maintenant',
      pages: 'pages',
      level: 'Niveau',
      subject: 'Matière',
      type: 'Type',
      preview_label: 'Aperçu (premières pages)',
    },
    cart: {
      title: 'Panier',
      total: 'Total',
      checkout: 'Passer la commande',
      empty: 'Votre panier est vide',
      remove: 'Supprimer',
    },
    payment: {
      title: 'Choisir le paiement',
      flouci: 'Flouci',
      d17: 'D17',
      card: 'Carte bancaire',
      transfer: 'Virement bancaire',
      paypal: 'PayPal',
      confirm: 'Confirmer la commande',
    },
    footer: {
      tagline: 'La plateforme de ressources éducatives',
      rights: 'Tous droits réservés',
    },
    admin: {
      title: 'Administration',
      dashboard: 'Tableau de bord',
      contents: 'Contenus',
      orders: 'Commandes',
      clients: 'Clients',
      settings: 'Paramètres',
      logout: 'Déconnexion',
    },
    types: {
      course: 'Cours',
      homework: 'Devoir',
      project: 'Projet',
      exam: 'Annales',
    },
  },
  ar: {
    dir: 'rtl',
    nav: {
      home: 'الرئيسية',
      catalog: 'الكتالوج',
      login: 'تسجيل الدخول',
      admin: 'الإدارة',
    },
    hero: {
      title: 'دروس وواجبات\nللنجاح',
      subtitle: 'موارد PDF عالية الجودة لجميع المستويات — الثانوية والجامعة والتكوين المهني.',
      cta: 'عرض الكتالوج',
      cta2: 'اعرف المزيد',
    },
    stats: {
      courses: 'درس متاح',
      students: 'طالب راضٍ',
      subjects: 'مادة مغطاة',
    },
    catalog: {
      title: 'الكتالوج',
      subtitle: 'ابحث عن الموارد التي تحتاجها',
      filter_all: 'الكل',
      filter_lycee: 'ثانوية',
      filter_uni: 'جامعة',
      filter_pro: 'تكوين',
      sort_popular: 'الأكثر شيوعاً',
      sort_recent: 'الأحدث',
      sort_price: 'السعر',
      buy: 'شراء',
      preview: 'معاينة',
      pages: 'صفحة',
      tnd: 'دينار',
    },
    product: {
      preview: 'معاينة مجانية',
      buy: 'اشترِ الآن',
      pages: 'صفحة',
      level: 'المستوى',
      subject: 'المادة',
      type: 'النوع',
      preview_label: 'معاينة (الصفحات الأولى)',
    },
    cart: {
      title: 'السلة',
      total: 'المجموع',
      checkout: 'إتمام الطلب',
      empty: 'السلة فارغة',
      remove: 'حذف',
    },
    payment: {
      title: 'اختر طريقة الدفع',
      flouci: 'فلوسي',
      d17: 'D17',
      card: 'بطاقة بنكية',
      transfer: 'تحويل بنكي',
      paypal: 'باي بال',
      confirm: 'تأكيد الطلب',
    },
    footer: {
      tagline: 'منصة الموارد التعليمية',
      rights: 'جميع الحقوق محفوظة',
    },
    admin: {
      title: 'الإدارة',
      dashboard: 'لوحة القيادة',
      contents: 'المحتوى',
      orders: 'الطلبات',
      clients: 'العملاء',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
    },
    types: {
      course: 'درس',
      homework: 'واجب',
      project: 'مشروع',
      exam: 'امتحانات',
    },
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('fr');
  const t = translations[lang];

  const toggle = () => {
    const next = lang === 'fr' ? 'ar' : 'fr';
    setLang(next);
    document.documentElement.dir = translations[next].dir;
    document.documentElement.lang = next;
  };

  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
