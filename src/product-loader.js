import products from './data/products.json';

export function initProductPage() {
  if (document.documentElement.dataset.page !== 'products' || !document.getElementById('dyn-title')) {
    return; // Not on the product detail page
  }

  const urlParams = new URLSearchParams(window.location.search);
  let productId = urlParams.get('id');

  // If no ID or ID not found, redirect to catalog
  if (!productId || !products[productId]) {
    window.location.href = '/products.html';
    return;
  }

  const data = products[productId];

  // Update text fields
  document.title = `${data.title} | PulseGlobal Trade`;
  document.getElementById('dyn-breadcrumb').textContent = data.title;
  document.getElementById('dyn-title').textContent = data.title;
  document.getElementById('dyn-desc').textContent = data.description;
  document.getElementById('dyn-badge').textContent = data.badge;
  document.getElementById('dyn-origin').textContent = data.origin;
  document.getElementById('dyn-moq').textContent = data.moq;
  document.getElementById('dyn-packaging').textContent = data.packaging;
  document.getElementById('dyn-private').textContent = data.privateLabel;

  // Update Quality Standards
  const qualityList = document.getElementById('dyn-quality');
  if (qualityList) {
    qualityList.innerHTML = data.qualityStandards.map(std => `
      <li class="flex items-start gap-2 font-body-md text-body-md text-on-surface-variant">
        <span class="material-symbols-outlined text-[18px] text-outline mt-1" aria-hidden="true">check</span>
        ${std}
      </li>
    `).join('');
  }

  // Update Export Availability
  const exportList = document.getElementById('dyn-export');
  if (exportList) {
    exportList.innerHTML = data.exportAvailability.map(exp => `
      <li class="px-3 py-1 bg-surface rounded-full font-label-sm text-label-sm text-on-surface-variant border border-outline-variant/30">${exp}</li>
    `).join('');
  }

  // Update Images
  const mainImg = document.querySelector('[data-gallery-main]');
  if (mainImg) {
    mainImg.src = data.mainImage;
    mainImg.alt = data.title;
  }

  const thumbBtns = document.querySelectorAll('[data-gallery-thumb]');
  thumbBtns.forEach((btn, index) => {
    const img = btn.querySelector('img');
    if (img && data.thumbnails[index]) {
      img.src = data.thumbnails[index];
      img.alt = `${data.title} - View ${index + 1}`;
    }
  });
}
