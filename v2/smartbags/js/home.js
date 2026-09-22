/* SmartBags — home.js */

document.addEventListener('DOMContentLoaded', async () => {
  const lang = getLang();
  applyDirection(lang);
  applyStaticTranslations(lang);

  let data;
  try {
    data = await getData();
  } catch (e) {
    console.error(e);
    renderLoadError(lang);
    return;
  }

  renderNavbar(data, 'home', lang, true);
  renderFooter(data, lang);
  renderFeatureIcons(data, 'site-features');
  renderHero(data);
  renderProductGrid(data, lang);
});

function renderHero(data) {
  const mount = document.getElementById('hero');
  if (!mount) return;
  mount.innerHTML = `
    <a class="hero" href="#shop" aria-label="${data.site.heroHeadline}">
      <img src="${data.site.banner}" alt="${data.site.heroHeadline}">
    </a>
  `;
}

function renderProductGrid(data, lang) {
  const mount = document.getElementById('product-grid');
  if (!mount) return;

  mount.innerHTML = data.products.map(p => `
    <article class="card">
      <a class="card-media" href="/${encodeURIComponent(p.id)}">
        ${p.oldPrice ? `<span class="card-badge">${t('saleBadge', lang)}</span>` : ''}
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      </a>
      <h3 class="card-name">${p.name}</h3>
      <div class="card-bottom">
        <div class="card-price">
          <span class="price-new">${formatPrice(p.price, lang)}</span>
          ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice, lang)}</span>` : ''}
        </div>
        <a class="btn btn-gold card-buy" href="/${encodeURIComponent(p.id)}">${t('buyNow', lang)}</a>
      </div>
    </article>
  `).join('');
}
