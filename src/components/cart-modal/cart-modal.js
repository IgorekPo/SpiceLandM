import { gsap } from 'gsap';
import {
  getCartSummary,
  removeCartItem,
  setCartItemQuantity,
} from '../../js/cart-store.js';

const formatWeight = (weight) => Number(weight.toFixed(2)).toLocaleString('uk-UA', {
  maximumFractionDigits: 2,
});

const itemMarkup = (item) => `
  <li class="cart-modal__item" data-cart-item data-product-id="${item.productId}" data-package-weight="${item.packageWeight}">
    <img class="cart-modal__thumb" src="${item.thumbnail}" alt="" />
    <div class="cart-modal__product">
      <strong>${item.name}</strong>
      <small>1 шт. · ${item.packageWeight}</small>
    </div>
    <div class="cart-modal__quantity" aria-label="Кількість упаковок ${item.name}">
      <button type="button" data-cart-decrease aria-label="Зменшити кількість ${item.name}">−</button>
      <output aria-live="polite">${item.quantity}</output>
      <button type="button" data-cart-increase aria-label="Збільшити кількість ${item.name}">+</button>
    </div>
    <strong class="cart-modal__line-weight">${formatWeight(item.totalWeight)} кг</strong>
    <button class="cart-modal__remove" type="button" data-cart-remove aria-label="Видалити ${item.name} з кошика">×</button>
  </li>
`;

export const initCartModal = ({ openContact }) => {
  const modal = document.querySelector('[data-cart-modal]');
  const dialog = modal?.querySelector('[data-cart-dialog]');
  const list = modal?.querySelector('[data-cart-list]');
  const empty = modal?.querySelector('[data-cart-empty]');
  const summaryElement = modal?.querySelector('[data-cart-summary]');
  const totalQuantity = modal?.querySelector('[data-cart-total-quantity]');
  const totalWeight = modal?.querySelector('[data-cart-total-weight]');
  const requestButton = modal?.querySelector('[data-cart-request]');
  const live = modal?.querySelector('[data-cart-live]');
  const closeButtons = modal?.querySelectorAll('[data-cart-close]');
  const openButtons = document.querySelectorAll('[data-cart-open]');
  if (!modal || !dialog || !list || !empty || !summaryElement || !requestButton || !closeButtons) return;

  let returnFocus = null;

  const render = (cart = getCartSummary()) => {
    list.innerHTML = cart.items.map(itemMarkup).join('');
    empty.hidden = cart.items.length > 0;
    summaryElement.hidden = cart.items.length === 0;
    requestButton.disabled = cart.items.length === 0;
    totalQuantity.textContent = String(cart.quantity);
    totalWeight.textContent = formatWeight(cart.totalWeight);
  };

  const close = ({ preserveLock = false, returnToTrigger = true } = {}) => {
    gsap.to(dialog, { y: 14, autoAlpha: 0, duration: 0.18, ease: 'power2.in' });
    gsap.to(modal, {
      autoAlpha: 0,
      duration: 0.22,
      onComplete: () => {
        modal.classList.remove('modal--open');
        modal.setAttribute('aria-hidden', 'true');
        if (!preserveLock) document.body.classList.remove('page--locked');
        if (returnToTrigger) returnFocus?.focus?.();
      },
    });
  };

  const open = (trigger) => {
    returnFocus = trigger || document.activeElement;
    render();
    modal.classList.add('modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('page--locked');
    gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26 });
    gsap.fromTo(dialog,
      { y: 22, scale: 0.98, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: 0.34, ease: 'power3.out', onComplete: () => dialog.focus() },
    );
  };

  list.addEventListener('click', (event) => {
    const itemElement = event.target.closest('[data-cart-item]');
    if (!itemElement) return;
    const { productId, packageWeight } = itemElement.dataset;
    const item = getCartSummary().items.find((cartItem) => (
      cartItem.productId === productId && cartItem.packageWeight === packageWeight
    ));
    if (!item) return;

    let nextSummary = null;
    if (event.target.closest('[data-cart-increase]')) {
      nextSummary = setCartItemQuantity(productId, packageWeight, item.quantity + 1);
    } else if (event.target.closest('[data-cart-decrease]')) {
      nextSummary = setCartItemQuantity(productId, packageWeight, item.quantity - 1);
    } else if (event.target.closest('[data-cart-remove]')) {
      nextSummary = removeCartItem(productId, packageWeight);
    }
    if (!nextSummary) return;
    render(nextSummary);
    live.textContent = `У кошику ${nextSummary.quantity} шт., загальна вага ${formatWeight(nextSummary.totalWeight)} кг.`;
  });

  requestButton.addEventListener('click', () => {
    openContact?.(requestButton);
    close({ preserveLock: true, returnToTrigger: false });
  });
  openButtons.forEach((button) => button.addEventListener('click', () => open(button)));
  closeButtons.forEach((button) => button.addEventListener('click', () => close()));
  window.addEventListener('cart:updated', (event) => {
    if (modal.classList.contains('modal--open')) render(event.detail);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('modal--open')) close();
  });

  render();
  return { open, close };
};
