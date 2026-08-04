import { marinadeLabels } from '../../data/marinades.js';
import { createMarinadeDropTimeline } from '../../animations/marinade-drop-animation.js';
import { collapseCard, expandCard } from '../../animations/card-expand-animation.js';
import { addMarinadeToCart } from '../../js/cart-store.js';
import { initializeMarinadeGallery } from '../marinade-gallery/marinade-gallery.js';

const icon = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const tasteIcons = [
  'M12 3 14 8l5 2-4 4 1 6-4-2-4 2 1-6-4-4 5-2 2-5Z',
  'M4 12c3-6 7-8 16-8-1 9-5 13-11 13-3 0-5-2-5-5Zm2 7c3-5 6-8 11-11',
  'M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8m-7.2 7.2-2.8 2.8',
  'M7 4h10l2 6-7 10L5 10l2-6Zm0 6h12M12 4v16',
  'M13 3c1 4-3 5-3 9 0 2 1 3 3 4-1-3 2-4 3-6 2 2 3 4 3 6a7 7 0 1 1-14 0c0-4 3-7 5-9',
];

const galleryMarkup = (product) => product.dishImages.map((source, index) => `
  <button class="marinade-gallery__slide" type="button" data-gallery-image="${index}" aria-label="Збільшити фото ${index + 1}: ${product.name}">
    <img src="${source}" alt="Готова страва з маринадом «${product.name}» — фото ${index + 1}" loading="lazy" />
    <span class="marinade-gallery__zoom" aria-hidden="true">⌕</span>
  </button>
`).join('');

export const createMarinadeCard = (product) => {
  const card = document.createElement('article');
  card.className = `marinade-card marinade-card--${product.type} marinade-card--${product.color}`;
  card.dataset.productId = product.id;
  card.dataset.type = product.type;
  card.dataset.color = product.color;
  card.dataset.suitable = product.suitableFor.join(' ');
  card.setAttribute('aria-labelledby', `${product.id}-title`);

  card.innerHTML = `
    <button class="marinade-card__close" type="button" data-card-close aria-label="Закрити картку «${product.name}»">×</button>
    <div class="marinade-card__summary">
      <div class="marinade-card__copy">
        <p class="marinade-card__type">${marinadeLabels.type[product.type]} маринад</p>
        <h3 class="marinade-card__title" id="${product.id}-title">${product.name}</h3>
        <ul class="marinade-card__tastes" aria-label="Смакові характеристики">
          ${product.tastes.map((taste, index) => `<li class="marinade-card__taste">${icon(tasteIcons[index])}<span>${taste}</span></li>`).join('')}
        </ul>
      </div>
      <div class="marinade-card__visual" aria-hidden="true">
        <div class="marinade-card__texture" data-marinade-texture>
          <img src="${product.textureImage}" alt="" />
        </div>
        <span class="marinade-card__drop-tail" data-marinade-drop-tail></span>
        <span class="marinade-card__drop-bead" data-marinade-drop-bead></span>
      </div>
    </div>
    <div class="marinade-card__actions">
      <button class="marinade-card__details-button" type="button" data-card-toggle aria-expanded="false" aria-controls="${product.id}-details">
        <span data-card-toggle-label>Докладніше</span>
        <span aria-hidden="true" data-card-chevron>⌄</span>
      </button>
      <button class="marinade-card__add-to-cart" type="button" data-add-to-cart aria-label="Додати «${product.name}» у кошик">
        <span aria-hidden="true">🛒</span>
        <span data-cart-label>Додати у кошик</span>
      </button>
    </div>
    <div class="marinade-card__expandable" id="${product.id}-details" data-card-expandable hidden>
      <div class="marinade-gallery" data-marinade-gallery>
        <div class="marinade-gallery__track" data-gallery-track>${galleryMarkup(product)}</div>
        <button class="marinade-gallery__arrow marinade-gallery__arrow--prev" type="button" data-gallery-prev aria-label="Попереднє фото">‹</button>
        <button class="marinade-gallery__arrow marinade-gallery__arrow--next" type="button" data-gallery-next aria-label="Наступне фото">›</button>
        <div class="marinade-gallery__dots" aria-hidden="true">
          ${product.dishImages.map((_, index) => `<span class="${index === 0 ? 'is-active' : ''}" data-gallery-dot="${index}"></span>`).join('')}
        </div>
      </div>
      <div class="marinade-card__info" data-card-info>
        <p class="marinade-card__description">${product.shortDescription}</p>
        <p><strong>Для чого підходить:</strong> ${product.suitableFor.map((item) => marinadeLabels.purpose[item]).join(', ')}.</p>
        <p><strong>Склад:</strong> ${product.composition}</p>
        <div class="marinade-card__facts">
          <span><small>Вага</small><strong>${product.packageWeight}</strong></span>
          <span><small>Ціна</small><strong>${product.price} ${product.currency}</strong></span>
        </div>
      </div>
    </div>
  `;

  return card;
};

export const initializeMarinadeCard = (card, product, { lightbox, requestExclusiveOpen, announce }) => {
  const toggle = card.querySelector('[data-card-toggle]');
  const toggleLabel = card.querySelector('[data-card-toggle-label]');
  const chevron = card.querySelector('[data-card-chevron]');
  const closeButton = card.querySelector('[data-card-close]');
  const cartButton = card.querySelector('[data-add-to-cart]');
  const cartLabel = card.querySelector('[data-cart-label]');
  const dropTimeline = createMarinadeDropTimeline(card);
  let expanded = false;
  let animating = false;

  window.requestAnimationFrame(() => {
    const bounds = card.getBoundingClientRect();
    card.dataset.closedHeight = String(card.offsetHeight);
    const fixedWidth = Math.floor(bounds.width);
    card.style.width = `${fixedWidth}px`;
    card.style.minWidth = `${fixedWidth}px`;
    card.style.maxWidth = `${fixedWidth}px`;
    card.style.flexBasis = `${fixedWidth}px`;
  });

  const close = async () => {
    if (!expanded || animating) return;
    animating = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggleLabel.textContent = 'Докладніше';
    chevron.textContent = '⌄';
    await collapseCard(card, dropTimeline);
    expanded = false;
    animating = false;
  };

  const open = async () => {
    if (expanded || animating) return;
    animating = true;
    await requestExclusiveOpen(close);
    toggle.setAttribute('aria-expanded', 'true');
    toggleLabel.textContent = 'Згорнути';
    chevron.textContent = '⌃';
    expanded = true;
    await expandCard(card, dropTimeline);
    animating = false;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  };

  toggle.addEventListener('click', () => (expanded ? close() : open()));
  closeButton.addEventListener('click', close);
  cartButton.addEventListener('click', () => {
    const summary = addMarinadeToCart(product);
    cartButton.classList.add('is-added');
    cartLabel.textContent = 'Додано';
    announce(`${product.name} додано у кошик. Товарів: ${summary.quantity}.`);
    window.setTimeout(() => {
      cartButton.classList.remove('is-added');
      cartLabel.textContent = 'Додати у кошик';
    }, 1200);
  });

  initializeMarinadeGallery(card, product, lightbox);
  return { close, isExpanded: () => expanded };
};
