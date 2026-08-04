import { gsap } from 'gsap';
import { getCartSummary } from '../../js/cart-store.js';

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
    .filter(Boolean)
    .join(' ');
};

export const initContactModal = ({ onSuccess }) => {
  const modal = document.querySelector('[data-modal="contact-modal"]');
  const dialog = modal?.querySelector('[data-modal-dialog]');
  const form = modal?.querySelector('[data-contact-form]');
  const phoneInput = modal?.querySelector('[data-phone-input]');
  const regionInput = modal?.querySelector('[data-region-input]');
  const submitButton = modal?.querySelector('[data-contact-submit]');
  const openButtons = document.querySelectorAll('[data-modal-open="contact-modal"]');
  const closeButtons = modal?.querySelectorAll('[data-modal-close]');

  if (!modal || !dialog || !form || !phoneInput || !regionInput || !submitButton || !closeButtons) return;

  let returnFocus = null;
  const touched = new WeakSet();

  const isPhoneValid = () => phoneInput.value.replace(/\D/g, '').length === 10 && phoneInput.value.startsWith('0');
  const isRegionValid = () => /\p{L}/u.test(regionInput.value);

  const updateField = (input, valid) => {
    const field = input.closest('[data-field]');
    if (!field) return;

    field.classList.toggle('contact-form__field--valid', valid);
    field.classList.toggle('contact-form__field--invalid', touched.has(input) && !valid);
    input.setAttribute('aria-invalid', String(touched.has(input) && !valid));
  };

  const updateForm = () => {
    const phoneValid = isPhoneValid();
    const regionValid = isRegionValid();
    updateField(phoneInput, phoneValid);
    updateField(regionInput, regionValid);
    submitButton.disabled = !(phoneValid && regionValid);
  };

  const close = ({ showSuccess = false } = {}) => {
    gsap.to(dialog, { y: 16, autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(modal, {
      autoAlpha: 0,
      duration: 0.25,
      ease: 'power2.inOut',
      onComplete: () => {
        modal.classList.remove('modal--open');
        modal.setAttribute('aria-hidden', 'true');

        if (showSuccess) {
          onSuccess?.();
        } else {
          document.body.classList.remove('page--locked');
          returnFocus?.focus?.();
        }
      },
    });
  };

  const open = (trigger) => {
    returnFocus = trigger || document.activeElement;
    modal.classList.add('modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('page--locked');

    gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 });
    gsap.fromTo(
      dialog,
      { y: 24, scale: 0.97, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: 0.38, ease: 'power3.out', onComplete: () => phoneInput.focus() },
    );
  };

  openButtons.forEach((button) => button.addEventListener('click', () => open(button)));
  closeButtons.forEach((button) => button.addEventListener('click', () => close()));

  phoneInput.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
    updateForm();
  });

  regionInput.addEventListener('input', updateForm);

  [phoneInput, regionInput].forEach((input) => {
    input.addEventListener('blur', () => {
      touched.add(input);
      updateForm();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    touched.add(phoneInput);
    touched.add(regionInput);
    updateForm();

    if (submitButton.disabled) return;

    // Telegram-відправлення підключається окремим модулем згідно зі специфікацією.
    form.dispatchEvent(
      new CustomEvent('spiceland:contact-submit', {
        bubbles: true,
        detail: {
          phone: `+38 ${phoneInput.value}`,
          region: regionInput.value.trim(),
          cart: getCartSummary(),
        },
      }),
    );

    form.reset();
    touched.delete(phoneInput);
    touched.delete(regionInput);
    updateForm();
    close({ showSuccess: true });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('modal--open')) close();
  });

  return { open, close };
};
