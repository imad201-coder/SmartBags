/* SmartBags — product.js */

let storeData = null;
let currentProduct = null;
let sliderIndex = 0;
let selectedColor = null;
let pageLang = 'ar';

/* The product page is reached either as a clean URL (/some-product-id,
   rewritten server-side to product.html) or, for backward compatibility,
   as the old product.html?id=some-product-id form. */
function getRequestedProductId() {
  const fromQuery = new URLSearchParams(window.location.search).get('id');
  if (fromQuery) return fromQuery;
  const path = window.location.pathname.replace(/^\/+/, '').replace(/\.html$/, '');
  if (!path || path === 'product') return null;
  return decodeURIComponent(path);
}

document.addEventListener('DOMContentLoaded', async () => {
  pageLang = getLang();
  applyDirection(pageLang);
  applyStaticTranslations(pageLang);

  try {
    storeData = await getData();
  } catch (e) {
    console.error(e);
    renderLoadError(pageLang);
    return;
  }

  renderNavbar(storeData, 'product', pageLang, true);
  renderFooter(storeData, pageLang);

  const id = getRequestedProductId();
  currentProduct = id ? findProduct(storeData, id) : null;

  if (!currentProduct) {
    window.location.href = '/home';
    return;
  }

  document.title = `${currentProduct.name} — SmartBags`;
  selectedColor = currentProduct.colors && currentProduct.colors.length ? currentProduct.colors[0] : null;

  renderSlider();
  renderProductInfo();
  renderColorPicker();
  renderFeatureIcons(storeData, 'product-features');
  renderDescription();
  wireModal();
});

/* ---------- slider ---------- */
function renderSlider() {
  const track = document.getElementById('slider-track');
  const dots = document.getElementById('slider-dots');
  if (!track || !dots) return;

  track.innerHTML = currentProduct.images.map(src => `<img src="${src}" alt="${currentProduct.name}">`).join('');
  dots.innerHTML = currentProduct.images.map((_, i) =>
    `<button class="slider-dot${i === 0 ? ' is-active' : ''}" data-i="${i}" aria-label="Image ${i + 1}"></button>`
  ).join('');

  sliderIndex = 0;
  updateSlider();

  document.getElementById('slider-prev').addEventListener('click', () => moveSlider(-1));
  document.getElementById('slider-next').addEventListener('click', () => moveSlider(1));
  dots.querySelectorAll('.slider-dot').forEach(dot => {
    dot.addEventListener('click', () => { sliderIndex = Number(dot.dataset.i); updateSlider(); });
  });
}

function moveSlider(dir) {
  const total = currentProduct.images.length;
  sliderIndex = (sliderIndex + dir + total) % total;
  updateSlider();
}

function updateSlider() {
  const track = document.getElementById('slider-track');
  track.style.transform = `translateX(-${sliderIndex * 100}%)`;
  document.querySelectorAll('.slider-dot').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === sliderIndex);
  });
}

/* ---------- info ---------- */
function renderProductInfo() {
  const mount = document.getElementById('product-info');
  if (!mount) return;
  mount.innerHTML = `
    <h1 class="product-name">${currentProduct.name}</h1>
    <p class="product-short">${currentProduct.short}</p>
    <div class="product-price-row">
      <span class="product-price-new">${formatPrice(currentProduct.price, pageLang)}</span>
      ${currentProduct.oldPrice ? `<span class="product-price-old">${formatPrice(currentProduct.oldPrice, pageLang)}</span>` : ''}
    </div>
    <div id="color-picker" class="color-picker"></div>
    <button class="btn btn-gold product-buy-btn" id="open-buy">${t('buyNow', pageLang)}</button>
  `;
  document.getElementById('open-buy').addEventListener('click', openModal);
}

function renderColorPicker() {
  const mount = document.getElementById('color-picker');
  if (!mount) return;
  if (!currentProduct.colors || !currentProduct.colors.length) { mount.innerHTML = ''; return; }

  mount.innerHTML = `
    <div class="color-picker-label">${t('colorLabel', pageLang)} — <bdi class="color-picker-current" id="color-current">${selectedColor.name}</bdi></div>
    <div class="color-swatches">
      ${currentProduct.colors.map((c, i) => `
        <button type="button" class="color-swatch${i === 0 ? ' is-selected' : ''}" data-i="${i}" style="background:${c.hex}44;" aria-label="${c.name}" title="${c.name}">
          <span style="background:${c.hex};"></span>
        </button>
      `).join('')}
    </div>
  `;

  mount.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = currentProduct.colors[Number(btn.dataset.i)];
      mount.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      document.getElementById('color-current').textContent = selectedColor.name;
      const modalColor = document.getElementById('modal-color-value');
      if (modalColor) modalColor.value = selectedColor.name;
    });
  });
}

function renderDescription() {
  const mount = document.getElementById('product-description');
  if (!mount) return;
  mount.innerHTML = `
    <h2>${t('description', pageLang)}</h2>
    <p>${currentProduct.description}</p>
  `;
}

/* ---------- buy popup ---------- */
function wireModal() {
  const overlay = document.getElementById('buy-modal');
  const provinceSelect = document.getElementById('field-province');
  const deliveryInputs = document.querySelectorAll('input[name="delivery-type"]');
  const totalValue = document.getElementById('order-total-value');
  const form = document.getElementById('buy-form');
  const error = document.getElementById('form-error');
  const submitBtn = form.querySelector('button[type="submit"]');

  const sortedProvinces = [...storeData.provinces].sort((a, b) => a.name.localeCompare(b.name));

  function feeForType(p, type) { return type === 'domicile' ? p.domicileFee : p.deskFee; }
  function currentType() { return document.querySelector('input[name="delivery-type"]:checked')?.value || 'desk'; }

  function renderProvinceOptions() {
    const type = currentType();
    const prev = provinceSelect.value;
    provinceSelect.innerHTML = `<option value="" disabled${prev ? '' : ' selected'}>${t('provincePlaceholder', pageLang)}</option>` +
      sortedProvinces.map(p => `<option value="${p.name}" data-fee="${feeForType(p, type)}"${p.name === prev ? ' selected' : ''}>${p.name} — ${formatPrice(feeForType(p, type), pageLang)}</option>`).join('');
  }
  renderProvinceOptions();

  function currentTotal() {
    const opt = provinceSelect.selectedOptions[0];
    const fee = opt && opt.dataset.fee ? Number(opt.dataset.fee) : 0;
    return currentProduct.price + fee;
  }

  function updateTotal() {
    totalValue.textContent = provinceSelect.value ? formatPrice(currentTotal(), pageLang) : formatPrice(currentProduct.price, pageLang);
  }
  updateTotal();

  provinceSelect.addEventListener('change', updateTotal);
  deliveryInputs.forEach(input => {
    input.addEventListener('change', () => {
      document.querySelectorAll('.delivery-option').forEach(el => el.classList.remove('is-checked'));
      input.closest('.delivery-option').classList.add('is-checked');
      renderProvinceOptions();
      updateTotal();
    });
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('field-name').value.trim();
    const phone = document.getElementById('field-phone').value.trim();
    const address = document.getElementById('field-address').value.trim();
    const province = provinceSelect.value;
    const deliveryType = document.querySelector('input[name="delivery-type"]:checked')?.value;

    if (!name || !phone || !address || !province || !deliveryType) {
      error.textContent = t('errorFillAll', pageLang);
      error.classList.add('is-visible');
      return;
    }
    if (phone.replace(/[^0-9]/g, '').length < 9) {
      error.textContent = t('errorPhone', pageLang);
      error.classList.add('is-visible');
      return;
    }
    error.classList.remove('is-visible');

    const payload = {
      productName: currentProduct.name,
      productPrice: currentProduct.price,
      color: selectedColor ? selectedColor.name : null,
      name, phone, address, province, deliveryType,
      total: currentTotal()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = t('placingOrder', pageLang);
    try {
      const order = await addOrder(payload);
      sessionStorage.setItem('smartbags_last_order', JSON.stringify(order));
      window.location.href = '/thankyou';
    } catch (err) {
      console.error(err);
      error.textContent = t('errorSubmit', pageLang);
      error.classList.add('is-visible');
      submitBtn.disabled = false;
      submitBtn.textContent = t('confirmOrder', pageLang);
    }
  });
}

function openModal() {
  const modalColorField = document.getElementById('modal-color-value');
  const colorRow = modalColorField ? modalColorField.closest('.field') : null;
  if (selectedColor) {
    if (modalColorField) modalColorField.value = selectedColor.name;
    if (colorRow) colorRow.style.display = '';
  } else if (colorRow) {
    colorRow.style.display = 'none';
  }
  document.getElementById('buy-modal').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('buy-modal').classList.remove('is-open');
  document.body.style.overflow = '';
}
