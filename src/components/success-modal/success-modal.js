import { gsap } from 'gsap';

export const initSuccessModal = () => {
  const modal = document.querySelector('[data-modal="success-modal"]');
  const dialog = modal?.querySelector('[data-modal-dialog]');
  const closeButtons = modal?.querySelectorAll('[data-modal-close]');

  if (!modal || !dialog || !closeButtons) return { open: () => {} };

  let returnFocus = null;

  const close = () => {
    gsap.to(dialog, { y: 16, autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(modal, {
      autoAlpha: 0,
      duration: 0.25,
      ease: 'power2.inOut',
      onComplete: () => {
        modal.classList.remove('modal--open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('page--locked');
        returnFocus?.focus?.();
      },
    });
  };

  const open = () => {
    returnFocus = document.activeElement;
    modal.classList.add('modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('page--locked');

    gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 });
    gsap.fromTo(
      dialog,
      { y: 24, scale: 0.97, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: 0.38, ease: 'power3.out', onComplete: () => dialog.focus() },
    );
  };

  closeButtons.forEach((button) => button.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('modal--open')) close();
  });

  return { open, close };
};

