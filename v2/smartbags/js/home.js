/* SmartBags — home.js */

document.addEventListener('DOMContentLoaded', async () => {
  let data;
  try {
    data = await getData();
  } catch (e) {
    console.error(e);
    renderLoadError();
    return;
  }

  renderNavbar(data, 'home');
  renderFooter(data);
  renderFeatureIcons(data, 'site-features');
  renderHero(data);
  renderProductGrid(data);
});

function renderHero(data) {
  const mount = document.getElementById('hero');
  if (!mount) return;
  mount.innerHTML = `
    <a class="hero" href="#shop" aria-label="Explore the collection — ${data.site.heroHeadline}">
      <img src="${data.site.banner}" alt="${data.site.heroHeadline}">
    </a>
  `;
}

function renderProductGrid(data) {
  const mount = document.getElementById('product-grid');
  if (!mount) return;

  mount.innerHTML = data.products.map(p => `
    <article class="card">
      <a class="card-media" href="product.html?id=${encodeURIComponent(p.id)}">
        ${p.oldPrice ? '<span class="card-badge">Sale</span>' : ''}
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      </a>
      <h3 class="card-name">${p.name}</h3>
      <div class="card-bottom">
        <div class="card-price">
          <span class="price-new">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        <a class="btn btn-gold card-buy" href="product.html?id=${encodeURIComponent(p.id)}">Buy now</a>
      </div>
    </article>
  `).join('');
}
