/* SmartBags — common.js
   Renders the navbar and footer from already-fetched store data.
   Include data.js before this file on every page. */

function renderNavbar(data, activePage) {
  const mount = document.getElementById('site-navbar');
  if (!mount) return;

  mount.innerHTML = `
    <div class="nav-inner">
      <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false">☰</button>
      <nav class="nav-links" id="nav-links">
        <a href="home.html" class="${activePage === 'home' ? 'is-active' : ''}">Home</a>
        <a href="home.html#shop" class="${activePage === 'product' ? 'is-active' : ''}">Shop</a>
      </nav>
      <a href="home.html" class="nav-logo"><img src="${data.site.logo}" alt="${data.site.shopName}"></a>
      <div class="nav-cta">
        <span class="nav-cta-text">${data.site.phone}</span>
      </div>
    </div>
  `;

  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
}

function renderFeatureIcons(data, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  mount.innerHTML = `
    <div class="features-inner">
      ${data.features.map(f => `
        <div class="feature">
          <span class="feature-icon">${f.icon}</span>
          <span class="feature-label">${f.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderFooter(data) {
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  const year = new Date().getFullYear();

  mount.innerHTML = `
    <div class="footer-inner">
      <div>
        <div class="footer-brand">${data.site.shopName}</div>
        <p class="footer-greeting">${data.site.greeting}.</p>
      </div>
      <div class="footer-phone">
        <span class="label">Order by phone</span>
        ${data.site.phone}
      </div>
    </div>
    <div class="footer-bottom">© ${year} ${data.site.shopName}. All rights reserved.</div>
  `;
}

/* Shown when /api/data can't be reached (network issue, KV not set up yet). */
function renderLoadError() {
  document.body.innerHTML = `
    <div style="max-width:480px;margin:80px auto;padding:0 24px;text-align:center;font-family:'Manrope',sans-serif;color:#8a97ab;">
      <p style="font-size:16px;">We couldn't load the store right now. Please refresh, or try again in a moment.</p>
    </div>
  `;
}
