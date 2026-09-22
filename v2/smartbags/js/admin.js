/* SmartBags — admin.js
   Gated by a password login (see wireLoginForm). Once signed in,
   everything here edits a single in-memory copy of the store's data
   (adminData); "Save" persists it to the server via saveData(). */

let adminData = null;
let currentOrders = [];
let openOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
  wireLoginForm();
  if (isAdminLoggedIn()) {
    bootAdmin();
  } else {
    showLoginGate();
  }
});

/* ---------- login gate ---------- */
function showLoginGate() {
  document.getElementById('admin-login-gate').style.display = 'flex';
  document.getElementById('admin-app').style.display = 'none';
}
function hideLoginGate() {
  document.getElementById('admin-login-gate').style.display = 'none';
  document.getElementById('admin-app').style.display = 'block';
}

function wireLoginForm() {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const btn = e.target.querySelector('button[type="submit"]');
    errorEl.classList.remove('is-visible');
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    let ok = false;
    try {
      ok = await adminLogin(pw);
    } catch (err) {
      console.error(err);
    }

    btn.disabled = false;
    btn.textContent = 'Sign in';

    if (!ok) {
      errorEl.textContent = 'Incorrect password.';
      errorEl.classList.add('is-visible');
      return;
    }
    bootAdmin();
  });
}

async function bootAdmin() {
  hideLoginGate();
  try {
    adminData = await getData();
  } catch (e) {
    console.error(e);
    document.getElementById('admin-app-body').innerHTML =
      '<p style="padding:40px;text-align:center;color:var(--muted);">Could not load store data. Please refresh.</p>';
    return;
  }

  renderNavbar(adminData, '', 'en', false);
  renderFooter(adminData, 'en');
  wireTabs();
  renderSettingsTab();
  renderIconsTab();
  renderProductsTab();
  renderProvincesTab();
  await renderOrdersTab();
  wireOrderModal();
  wireBackupTab();
  wireLogout();
}

function wireLogout() {
  const btn = document.getElementById('admin-logout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    clearAdminToken();
    location.reload();
  });
}

/* Wrap any admin action that writes to the server: on an expired/invalid
   session, sign the admin out and show the login screen again. */
async function withAuthGuard(fn) {
  try {
    await fn();
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') {
      clearAdminToken();
      toast('Session expired — please sign in again');
      showLoginGate();
    } else {
      console.error(e);
      toast('Something went wrong — please try again');
    }
  }
}

/* ---------- tabs ---------- */
function wireTabs() {
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('is-active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('is-active');
    });
  });
}

function toast(msg) {
  const el = document.getElementById('admin-toast');
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* "home", "thankyou" and "admin" are reserved by vercel.json's routing —
   a product with one of these ids would be unreachable at its clean URL. */
const RESERVED_SLUGS = ['home', 'thankyou', 'admin'];

function slugify(str) {
  let base = (str || 'product').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product';
  let id = base, n = 2;
  while (adminData.products.some(p => p.id === id) || RESERVED_SLUGS.includes(id)) { id = `${base}-${n}`; n++; }
  return id;
}

/* ============================================================
   Settings tab
   ============================================================ */
function renderSettingsTab() {
  const s = adminData.site;
  const mount = document.getElementById('tab-settings');
  mount.innerHTML = `
    <div class="admin-card">
      <h2>Shop details</h2>
      <div class="admin-grid">
        <div class="admin-field"><label>Shop name</label><input type="text" id="s-shopName" value="${escAttr(s.shopName)}"></div>
        <div class="admin-field"><label>Tagline</label><input type="text" id="s-tagline" value="${escAttr(s.tagline)}"></div>
        <div class="admin-field"><label>Phone number</label><input type="tel" id="s-phone" value="${escAttr(s.phone)}"></div>
        <div class="admin-field"><label>Footer greeting</label><input type="text" id="s-greeting" value="${escAttr(s.greeting)}"></div>
      </div>
      <div class="admin-field"><label>Hero headline (image alt text)</label><input type="text" id="s-heroHeadline" value="${escAttr(s.heroHeadline)}"></div>
      <div class="admin-field"><label>Hero subline</label><input type="text" id="s-heroSubline" value="${escAttr(s.heroSubline)}"></div>
    </div>

    <div class="admin-card">
      <h2>Logo</h2>
      <img class="preview-lg" id="s-logo-preview" src="${s.logo}" alt="Logo preview">
      <div><label class="file-btn">Upload new logo<input type="file" id="s-logo-file" accept="image/*"></label></div>
    </div>

    <div class="admin-card">
      <h2>Homepage header image</h2>
      <img class="preview-lg" id="s-banner-preview" src="${s.banner}" alt="Banner preview">
      <div><label class="file-btn">Upload new banner<input type="file" id="s-banner-file" accept="image/*"></label></div>
    </div>

    <button class="btn btn-gold" id="save-settings">Save changes</button>
  `;

  ['shopName', 'tagline', 'phone', 'greeting', 'heroHeadline', 'heroSubline'].forEach(field => {
    document.getElementById('s-' + field).addEventListener('input', e => {
      adminData.site[field] = e.target.value;
    });
  });

  document.getElementById('s-logo-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    adminData.site.logo = dataUrl;
    document.getElementById('s-logo-preview').src = dataUrl;
  });
  document.getElementById('s-banner-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    adminData.site.banner = dataUrl;
    document.getElementById('s-banner-preview').src = dataUrl;
  });

  document.getElementById('save-settings').addEventListener('click', () => withAuthGuard(async () => {
    await saveData(adminData);
    renderNavbar(adminData, '', 'en', false);
    renderFooter(adminData, 'en');
    toast('Settings saved');
  }));
}

/* ============================================================
   Feature icons tab
   ============================================================ */
function renderIconsTab() {
  const mount = document.getElementById('icons-list');
  mount.innerHTML = adminData.features.map((f, i) => `
    <div class="icon-row">
      <input type="text" data-i="${i}" class="icon-input" value="${escAttr(f.icon)}" maxlength="2" aria-label="Icon">
      <input type="text" data-i="${i}" class="label-input" value="${escAttr(f.label)}" aria-label="Label">
      <button class="icon-btn" data-i="${i}" id="del-icon-${i}">Remove</button>
    </div>
  `).join('');

  mount.querySelectorAll('.icon-input').forEach(inp => {
    inp.addEventListener('input', e => { adminData.features[Number(e.target.dataset.i)].icon = e.target.value; });
  });
  mount.querySelectorAll('.label-input').forEach(inp => {
    inp.addEventListener('input', e => { adminData.features[Number(e.target.dataset.i)].label = e.target.value; });
  });
  mount.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      adminData.features.splice(Number(btn.dataset.i), 1);
      renderIconsTab();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-icon').addEventListener('click', () => {
    adminData.features.push({ icon: '★', label: 'New benefit' });
    renderIconsTab();
  });
  document.getElementById('save-icons').addEventListener('click', () => withAuthGuard(async () => {
    await saveData(adminData);
    toast('Icons saved');
  }));
});

/* ============================================================
   Products tab
   ============================================================ */
function renderProductsTab() {
  const mount = document.getElementById('products-list');
  mount.innerHTML = adminData.products.map((p, i) => `
    <div class="product-item">
      <div class="product-item-head">
        <strong>${escHtml(p.name) || 'New product'}</strong>
        <button class="icon-btn" id="del-product-${i}">Delete product</button>
      </div>
      <div class="admin-grid">
        <div class="admin-field"><label>Name</label><input type="text" data-i="${i}" data-f="name" class="p-input" value="${escAttr(p.name)}"></div>
        <div class="admin-field"><label>Short tagline</label><input type="text" data-i="${i}" data-f="short" class="p-input" value="${escAttr(p.short)}"></div>
        <div class="admin-field"><label>Price (DA)</label><input type="number" min="0" data-i="${i}" data-f="price" class="p-input" value="${p.price}"></div>
        <div class="admin-field"><label>Old price (DA, optional)</label><input type="number" min="0" data-i="${i}" data-f="oldPrice" class="p-input" value="${p.oldPrice ?? ''}"></div>
      </div>
      <div class="admin-field"><label>Description</label><textarea rows="3" data-i="${i}" data-f="description" class="p-input">${escHtml(p.description)}</textarea></div>
      <div class="admin-field">
        <label>Colors</label>
        ${(p.colors || []).map((c, ci) => `
          <div class="color-edit-row">
            <input type="color" data-i="${i}" data-ci="${ci}" class="color-hex" value="${c.hex}">
            <input type="text" data-i="${i}" data-ci="${ci}" class="color-name" value="${escAttr(c.name)}" placeholder="Color name">
            <button class="icon-btn del-color" data-i="${i}" data-ci="${ci}">Remove</button>
          </div>
        `).join('')}
        <button class="icon-btn gold add-color" data-i="${i}">Add color</button>
      </div>
      <div class="admin-field">
        <label>Images</label>
        <div class="thumb-row">
          ${p.images.map((img, ii) => `
            <div class="thumb"><img src="${img}" alt=""><button data-i="${i}" data-ii="${ii}" class="del-img">×</button></div>
          `).join('')}
        </div>
        <label class="file-btn">Add image<input type="file" accept="image/*" class="add-img-file" data-i="${i}"></label>
      </div>
    </div>
  `).join('');

  mount.querySelectorAll('.p-input').forEach(inp => {
    inp.addEventListener('input', e => {
      const i = Number(e.target.dataset.i), f = e.target.dataset.f;
      if (f === 'price') adminData.products[i].price = Number(e.target.value) || 0;
      else if (f === 'oldPrice') adminData.products[i].oldPrice = e.target.value ? Number(e.target.value) : null;
      else adminData.products[i][f] = e.target.value;
      if (f === 'name') {
        e.target.closest('.product-item').querySelector('.product-item-head strong').textContent = e.target.value || 'New product';
      }
    });
  });
  mount.querySelectorAll('[id^="del-product-"]').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      adminData.products.splice(idx, 1);
      renderProductsTab();
    });
  });
  mount.querySelectorAll('.del-img').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i), ii = Number(btn.dataset.ii);
      if (adminData.products[i].images.length <= 1) { toast('A product needs at least one image'); return; }
      adminData.products[i].images.splice(ii, 1);
      renderProductsTab();
    });
  });
  mount.querySelectorAll('.add-img-file').forEach(inp => {
    inp.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const dataUrl = await readFileAsDataURL(file);
      adminData.products[Number(e.target.dataset.i)].images.push(dataUrl);
      renderProductsTab();
    });
  });

  mount.querySelectorAll('.color-hex').forEach(inp => {
    inp.addEventListener('input', e => {
      adminData.products[Number(e.target.dataset.i)].colors[Number(e.target.dataset.ci)].hex = e.target.value;
    });
  });
  mount.querySelectorAll('.color-name').forEach(inp => {
    inp.addEventListener('input', e => {
      adminData.products[Number(e.target.dataset.i)].colors[Number(e.target.dataset.ci)].name = e.target.value;
    });
  });
  mount.querySelectorAll('.del-color').forEach(btn => {
    btn.addEventListener('click', () => {
      adminData.products[Number(btn.dataset.i)].colors.splice(Number(btn.dataset.ci), 1);
      renderProductsTab();
    });
  });
  mount.querySelectorAll('.add-color').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = adminData.products[Number(btn.dataset.i)];
      if (!p.colors) p.colors = [];
      p.colors.push({ name: 'New color', hex: '#cf9d4f' });
      renderProductsTab();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-product').addEventListener('click', () => {
    adminData.products.push({
      id: slugify('new-product-' + (adminData.products.length + 1)),
      name: '', price: 0, oldPrice: null,
      images: ['images/products/aria-1.svg'],
      short: '', description: '',
      colors: [{ name: 'Midnight Navy', hex: '#16304f' }]
    });
    renderProductsTab();
  });
  document.getElementById('save-products').addEventListener('click', () => withAuthGuard(async () => {
    adminData.products.forEach(p => { if (!p.name) p.name = 'Untitled product'; });
    await saveData(adminData);
    toast('Products saved');
  }));
});

/* ============================================================
   Provinces & delivery tab
   ============================================================ */
function renderProvincesTab() {
  const rows = adminData.provinces.map((p, i) => `
    <tr>
      <td>${escHtml(p.name)}</td>
      <td><input type="number" min="0" data-i="${i}" data-f="deskFee" class="prov-fee" value="${p.deskFee}"></td>
      <td><input type="number" min="0" data-i="${i}" data-f="domicileFee" class="prov-fee" value="${p.domicileFee}"></td>
    </tr>
  `).join('');

  document.getElementById('provinces-table-body').innerHTML = rows;
  document.querySelectorAll('.prov-fee').forEach(inp => {
    inp.addEventListener('input', e => {
      adminData.provinces[Number(e.target.dataset.i)][e.target.dataset.f] = Number(e.target.value) || 0;
    });
  });

  document.getElementById('save-provinces').addEventListener('click', () => withAuthGuard(async () => {
    await saveData(adminData);
    toast('Delivery fees saved');
  }));
}

/* ============================================================
   Orders tab
   ============================================================ */
async function renderOrdersTab() {
  const wrap = document.getElementById('orders-table-wrap');
  const empty = document.getElementById('orders-empty');

  try {
    currentOrders = await getOrders();
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') throw e;
    console.error(e);
    toast('Could not load orders');
    return;
  }

  if (!currentOrders.length) {
    wrap.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  wrap.style.display = '';
  empty.style.display = 'none';

  document.getElementById('orders-table-body').innerHTML = currentOrders.map(o => `
    <tr>
      <td class="nowrap">${formatOrderDate(o.createdAt)}</td>
      <td>${escHtml(o.name)}</td>
      <td>${escHtml(o.productName)}${o.color ? ` <span style="color:var(--muted);">(${escHtml(o.color)})</span>` : ''}</td>
      <td class="nowrap">${formatPrice(o.total)}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td><button class="icon-btn gold manage-order" data-id="${o.id}">Manage</button></td>
    </tr>
  `).join('');

  document.querySelectorAll('.manage-order').forEach(btn => {
    btn.addEventListener('click', () => openOrderModal(btn.dataset.id));
  });
}

function formatOrderDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return iso; }
}

function openOrderModal(id) {
  const order = currentOrders.find(o => o.id === id);
  if (!order) return;
  openOrderId = id;

  const deliveryLabel = order.deliveryType === 'domicile' ? 'Home delivery' : 'Stop desk';
  document.getElementById('order-modal-body').innerHTML = `
    <div class="order-detail-row"><span>Order</span><span>${order.id}</span></div>
    <div class="order-detail-row"><span>Date</span><span>${formatOrderDate(order.createdAt)}</span></div>
    <div class="order-detail-row"><span>Customer</span><span>${escHtml(order.name)}</span></div>
    <div class="order-detail-row"><span>Phone</span><span>${escHtml(order.phone)}</span></div>
    <div class="order-detail-row"><span>Address</span><span>${escHtml(order.address)}</span></div>
    <div class="order-detail-row"><span>Province</span><span>${escHtml(order.province)}</span></div>
    <div class="order-detail-row"><span>Delivery</span><span>${deliveryLabel}</span></div>
    <div class="order-detail-row"><span>Product</span><span>${escHtml(order.productName)}</span></div>
    ${order.color ? `<div class="order-detail-row"><span>Color</span><span>${escHtml(order.color)}</span></div>` : ''}
    <div class="order-detail-row"><span>Total</span><span>${formatPrice(order.total)}</span></div>
  `;
  document.getElementById('order-status-select').value = order.status;
  document.getElementById('order-modal').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  document.getElementById('order-modal').classList.remove('is-open');
  document.body.style.overflow = '';
  openOrderId = null;
}

function wireOrderModal() {
  document.getElementById('order-modal-close').addEventListener('click', closeOrderModal);
  document.getElementById('order-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('order-modal')) closeOrderModal();
  });
  document.getElementById('save-order-status').addEventListener('click', () => withAuthGuard(async () => {
    if (!openOrderId) return;
    const status = document.getElementById('order-status-select').value;
    await updateOrderStatus(openOrderId, status);
    await renderOrdersTab();
    closeOrderModal();
    toast('Order updated');
  }));
  document.getElementById('refresh-orders').addEventListener('click', () => withAuthGuard(async () => {
    await renderOrdersTab();
    toast('Orders refreshed');
  }));
}

/* ============================================================
   Backup tab
   ============================================================ */
function wireBackupTab() {
  document.getElementById('export-data').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(adminData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartbags-data.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-file').addEventListener('change', (e) => withAuthGuard(async () => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed.site || !parsed.products || !parsed.provinces) throw new Error('Invalid file');
    adminData = parsed;
    await saveData(adminData);
    renderNavbar(adminData, '', 'en', false);
    renderFooter(adminData, 'en');
    renderSettingsTab();
    renderIconsTab();
    renderProductsTab();
    renderProvincesTab();
    toast('Data imported');
    e.target.value = '';
  }));

  document.getElementById('reset-data').addEventListener('click', () => withAuthGuard(async () => {
    if (!confirm('Reload store data from the server? Any unsaved changes on this page will be lost.')) return;
    adminData = await getData();
    renderNavbar(adminData, '', 'en', false);
    renderFooter(adminData, 'en');
    renderSettingsTab();
    renderIconsTab();
    renderProductsTab();
    renderProvincesTab();
    toast('Reloaded from server');
  }));
}

/* ---------- tiny escaping helpers ---------- */
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
function escAttr(str) {
  return escHtml(str).replace(/"/g, '&quot;');
}
