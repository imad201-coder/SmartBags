/* SmartBags — shared data layer (client)
   Talks to the /api/* serverless functions, which are backed by
   Vercel KV. Reading the catalog is public; saving store data and
   viewing/managing orders requires the admin password entered on
   admin.html (sent back as a Bearer token on every protected call). */

const ORDER_STATUSES = ['waiting', 'confirmed', 'delivered', 'cancelled'];
const TOKEN_KEY = 'smartbags_admin_token';

async function getData() {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error('Could not load store data');
  return res.json();
}

async function saveData(data) {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getAdminToken() },
    body: JSON.stringify(data)
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Could not save store data');
  return true;
}

async function getOrders() {
  const res = await fetch('/api/orders', {
    headers: { 'Authorization': 'Bearer ' + getAdminToken() }
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Could not load orders');
  return res.json();
}

/* order: { productName, productPrice, color, name, phone, address, province, deliveryType, total } */
async function addOrder(order) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  if (!res.ok) throw new Error('Could not place the order');
  return res.json();
}

async function updateOrderStatus(id, status) {
  const res = await fetch('/api/orders/' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getAdminToken() },
    body: JSON.stringify({ status })
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error('Could not update the order');
  return res.json();
}

/* ---------- admin session (the password itself acts as the token) ---------- */
async function adminLogin(password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) return false;
  setAdminToken(password);
  return true;
}

function getAdminToken() { return sessionStorage.getItem(TOKEN_KEY) || ''; }
function setAdminToken(pw) { sessionStorage.setItem(TOKEN_KEY, pw); }
function clearAdminToken() { sessionStorage.removeItem(TOKEN_KEY); }
function isAdminLoggedIn() { return Boolean(getAdminToken()); }

function findProduct(data, id) {
  return data.products.find(p => p.id === id);
}

function formatPrice(n, lang) {
  lang = lang || getLang();
  const num = Math.round(Number(n) || 0);
  const formatted = num.toLocaleString('fr-FR').replace(/\u202F|\u00A0/g, ' ');
  return formatted + ' ' + t('currency', lang);
}
