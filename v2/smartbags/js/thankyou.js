/* SmartBags — thankyou.js */

document.addEventListener('DOMContentLoaded', async () => {
  let data;
  try {
    data = await getData();
  } catch (e) {
    console.error(e);
    renderLoadError();
    return;
  }

  renderNavbar(data, '');
  renderFooter(data);

  const raw = sessionStorage.getItem('smartbags_last_order');
  const order = raw ? JSON.parse(raw) : null;
  const mount = document.getElementById('thankyou-content');

  if (!order) {
    mount.innerHTML = `
      <div class="thankyou-mark">✓</div>
      <h1>Thank you!</h1>
      <p class="lead">Your visit means a lot to us. Browse the collection to place an order.</p>
      <a class="btn btn-gold" href="home.html">Back to shop</a>
    `;
    return;
  }

  const deliveryLabel = order.deliveryType === 'domicile' ? 'Home delivery' : 'Stop desk';

  mount.innerHTML = `
    <div class="thankyou-mark">✓</div>
    <h1>Order received, ${escapeHtml(order.name)}</h1>
    <p class="lead">${data.site.greeting}. We'll call you at ${escapeHtml(order.phone)} to confirm your order shortly.</p>
    <div class="order-card">
      <div class="order-row"><span>Product</span><span>${escapeHtml(order.productName)}${order.color ? ' — ' + escapeHtml(order.color) : ''}</span></div>
      <div class="order-row"><span>Delivery</span><span>${deliveryLabel} — ${escapeHtml(order.province)}</span></div>
      <div class="order-row"><span>Address</span><span>${escapeHtml(order.address)}</span></div>
      <div class="order-row total"><span>Total to pay on delivery</span><span>${formatPrice(order.total)}</span></div>
    </div>
    <a class="btn btn-outline" href="home.html">Continue shopping</a>
  `;

  sessionStorage.removeItem('smartbags_last_order');
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
