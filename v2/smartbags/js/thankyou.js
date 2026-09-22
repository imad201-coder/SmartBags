/* SmartBags — thankyou.js */

document.addEventListener('DOMContentLoaded', async () => {
  const lang = getLang();
  applyDirection(lang);

  let data;
  try {
    data = await getData();
  } catch (e) {
    console.error(e);
    renderLoadError(lang);
    return;
  }

  renderNavbar(data, '', lang, true);
  renderFooter(data, lang);

  const raw = sessionStorage.getItem('smartbags_last_order');
  const order = raw ? JSON.parse(raw) : null;
  const mount = document.getElementById('thankyou-content');

  if (!order) {
    mount.innerHTML = `
      <div class="thankyou-mark">✓</div>
      <h1>${t('thankyouTitleNoOrder', lang)}</h1>
      <p class="lead">${t('thankyouLeadNoOrder', lang)}</p>
      <a class="btn btn-gold" href="/home">${t('backToShop', lang)}</a>
    `;
    return;
  }

  const deliveryLabel = order.deliveryType === 'domicile' ? t('homeDelivery', lang) : t('stopDesk', lang);

  mount.innerHTML = `
    <div class="thankyou-mark">✓</div>
    <h1>${tf('orderReceived', { name: escapeHtml(order.name) }, lang)}</h1>
    <p class="lead">${data.site.greeting}. ${tf('thankyouCallBack', { phone: '<span dir="ltr">' + escapeHtml(order.phone) + '</span>' }, lang)}</p>
    <div class="order-card">
      <div class="order-row"><span>${t('productLabel', lang)}</span><span>${escapeHtml(order.productName)}${order.color ? ' — ' + escapeHtml(order.color) : ''}</span></div>
      <div class="order-row"><span>${t('deliveryLabel', lang)}</span><span>${deliveryLabel} — ${escapeHtml(order.province)}</span></div>
      <div class="order-row"><span>${t('addressLabel2', lang)}</span><span>${escapeHtml(order.address)}</span></div>
      <div class="order-row total"><span>${t('totalDueLabel', lang)}</span><span dir="ltr">${formatPrice(order.total, lang)}</span></div>
    </div>
    <a class="btn btn-outline" href="/home">${t('continueShopping', lang)}</a>
  `;

  if (typeof fbq === 'function') {
    fbq('track', 'Purchase', {
      value: order.total, 
      currency: 'DZD'
    });
  }

  sessionStorage.removeItem('smartbags_last_order');
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
