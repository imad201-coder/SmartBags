/* SmartBags — common.js
   Renders the navbar and footer from already-fetched store data.
   Include i18n.js and data.js before this file on every page.

   lang: 'en' | 'ar' — pass explicitly. Admin always passes 'en'.
   showLangToggle: whether to render the EN/AR switch (storefront only). */

function renderNavbar(data, activePage, lang, showLangToggle) {
  const mount = document.getElementById('site-navbar');
  if (!mount) return;
  lang = lang || 'en';
  if (showLangToggle === undefined) showLangToggle = true;

  mount.innerHTML = `
    <div class="nav-inner">
      <button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false">☰</button>
      <nav class="nav-links" id="nav-links">
        <a href="/home" class="${activePage === 'home' ? 'is-active' : ''}">${t('navHome', lang)}</a>
        <a href="/home#shop" class="${activePage === 'product' ? 'is-active' : ''}">${t('navShop', lang)}</a>
      </nav>
      <a href="/home" class="nav-logo"><img src="${data.site.logo}" alt="${data.site.shopName}"></a>
      <div class="nav-cta">
        <span class="nav-cta-text" dir="ltr">${data.site.phone}</span>
        ${showLangToggle ? `
        <div class="lang-switch" role="group" aria-label="Language">
          <button type="button" class="lang-btn${lang === 'en' ? ' is-active' : ''}" data-lang="en">EN</button>
          <button type="button" class="lang-btn${lang === 'ar' ? ' is-active' : ''}" data-lang="ar">AR</button>
        </div>` : ''}
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

  if (showLangToggle) {
    mount.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.lang === lang) return;
        setLang(btn.dataset.lang);
        location.reload();
      });
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

function renderFooter(data, lang) {
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  lang = lang || 'en';
  const year = new Date().getFullYear();

  mount.innerHTML = `
    <div class="footer-inner">
      <div>
        <div class="footer-brand">${data.site.shopName}</div>
        <p class="footer-greeting">${data.site.greeting}.</p>
      </div>
      <div class="footer-phone">
        <span class="label">${t('footerPhoneLabel', lang)}</span>
        <span dir="ltr">${data.site.phone}</span>
      </div>
    </div>
    <div class="footer-bottom">© ${year} ${data.site.shopName}. ${t('footerRights', lang)}</div>
  `;
}

/* Shown when /api/data can't be reached (network issue, KV not set up yet). */
function renderLoadError(lang) {
  const msg = (typeof t === 'function') ? t('loadError', lang) : "We couldn't load the store right now. Please refresh, or try again in a moment.";
  document.body.innerHTML = `
    <div style="max-width:480px;margin:80px auto;padding:0 24px;text-align:center;font-family:'Manrope',sans-serif;color:#8a97ab;">
      <p style="font-size:16px;">${msg}</p>
    </div>
  `;
}
