/* SmartBags — i18n.js
   Minimal language switcher for the storefront (home / product /
   thank-you pages). The admin panel intentionally stays English/LTR
   always, regardless of what a customer has chosen on their device.

   This only translates interface chrome (buttons, labels, headings).
   Content you type into Admin — product names, descriptions, feature
   labels, shop tagline/greeting — is NOT auto-translated; it displays
   exactly as entered, in whichever language you typed it. */

const LANG_KEY = 'smartbags_lang';
const DEFAULT_LANG = 'ar';

const TRANSLATIONS = {
  en: {
    navHome: 'Home',
    navShop: 'Shop',
    footerPhoneLabel: 'Order by phone',
    footerRights: 'All rights reserved.',
    shopTitle: 'The collection',
    shopSubtitle: 'Modern silhouettes and luxury materials, quality-checked before every delivery.',
    saleBadge: 'Sale',
    buyNow: 'Buy now',
    description: 'Description',
    modalTitle: 'Complete your order',
    modalSubtitle: 'Fill in your details — you pay in cash when your order arrives.',
    colorLabel: 'Color',
    nameLabel: 'Full name',
    phoneLabel: 'Phone number',
    addressLabel: 'Address',
    provinceLabel: 'Province',
    provincePlaceholder: 'Select your province',
    deliveryTypeLabel: 'Delivery type',
    stopDesk: 'Stop desk',
    homeDelivery: 'Home delivery',
    totalLabel: 'Total to pay',
    confirmOrder: 'Confirm order',
    placingOrder: 'Placing order…',
    errorFillAll: 'Please fill in every field before confirming your order.',
    errorPhone: 'Please enter a valid phone number.',
    errorSubmit: 'Could not place your order — please check your connection and try again.',
    thankyouTitleNoOrder: 'Thank you!',
    thankyouLeadNoOrder: 'Your visit means a lot to us. Browse the collection to place an order.',
    backToShop: 'Back to shop',
    orderReceived: 'Order received, {name}',
    thankyouCallBack: "We'll call you at {phone} to confirm your order shortly.",
    productLabel: 'Product',
    deliveryLabel: 'Delivery',
    addressLabel2: 'Address',
    totalDueLabel: 'Total to pay on delivery',
    continueShopping: 'Continue shopping',
    loadError: "We couldn't load the store right now. Please refresh, or try again in a moment.",
    currency: 'DA'
  },
  ar: {
    navHome: 'الرئيسية',
    navShop: 'المتجر',
    footerPhoneLabel: 'اطلب عبر الهاتف',
    footerRights: 'جميع الحقوق محفوظة.',
    shopTitle: 'منتجاتنا',
    shopSubtitle: 'تصاميم عصرية وخامات فاخرة، تُفحص قبل كل عملية توصيل.',
    saleBadge: 'تخفيض',
    buyNow: 'اشترِ الآن',
    description: 'الوصف',
    modalTitle: 'أكمل طلبك',
    modalSubtitle: 'أدخل بياناتك — الدفع نقدًا عند الاستلام.',
    colorLabel: 'اللون',
    nameLabel: 'الاسم الكامل',
    phoneLabel: 'رقم الهاتف',
    addressLabel: 'العنوان',
    provinceLabel: 'الولاية',
    provincePlaceholder: 'اختر ولايتك',
    deliveryTypeLabel: 'نوع التوصيل',
    stopDesk: 'مكتب التوصيل',
    homeDelivery: 'التوصيل للمنزل',
    totalLabel: 'المجموع للدفع',
    confirmOrder: 'تأكيد الطلب',
    placingOrder: 'جارٍ إرسال الطلب…',
    errorFillAll: 'يرجى تعبئة جميع الحقول قبل تأكيد الطلب.',
    errorPhone: 'يرجى إدخال رقم هاتف صحيح.',
    errorSubmit: 'تعذر إرسال الطلب، يرجى التحقق من الاتصال والمحاولة مجددًا.',
    thankyouTitleNoOrder: 'شكرًا لك!',
    thankyouLeadNoOrder: 'زيارتك تهمنا كثيرًا. تصفح التشكيلة لتقديم طلبك.',
    backToShop: 'العودة إلى المتجر',
    orderReceived: 'تم استلام طلبك، {name}',
    thankyouCallBack: 'سنتصل بك على {phone} لتأكيد طلبك قريبًا.',
    productLabel: 'المنتج',
    deliveryLabel: 'التوصيل',
    addressLabel2: 'العنوان',
    totalDueLabel: 'المبلغ الإجمالي عند التسليم',
    continueShopping: 'متابعة التسوق',
    loadError: 'تعذر تحميل المتجر حاليًا. يرجى تحديث الصفحة أو المحاولة لاحقًا.',
    currency: 'DA'
  }
};

function getLang() {
  const stored = localStorage.getItem(LANG_KEY);
  return stored === 'en' || stored === 'ar' ? stored : DEFAULT_LANG;
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang === 'en' ? 'en' : 'ar');
}

function t(key, lang) {
  lang = lang || getLang();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
}

/* t() with {placeholders}, e.g. tf('orderReceived', { name: 'Sara' }) */
function tf(key, vars, lang) {
  let str = t(key, lang);
  Object.keys(vars || {}).forEach(k => { str = str.split('{' + k + '}').join(vars[k]); });
  return str;
}

function applyDirection(lang) {
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
}

/* Translates any static markup tagged with data-i18n / data-i18n-placeholder. */
function applyStaticTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'), lang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'), lang));
  });
}
