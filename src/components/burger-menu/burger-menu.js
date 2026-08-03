import { gsap } from 'gsap';

export const initBurgerMenu = () => {
  const menu = document.querySelector('[data-burger-menu]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const links = menu?.querySelectorAll('.burger-menu__link');

  if (!menu || !toggle || !links) return;

  let isOpen = false;

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    toggle.classList.remove('menu-toggle--active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Відкрити меню');
    menu.setAttribute('aria-hidden', 'true');

    gsap.to(menu, {
      autoAlpha: 0,
      duration: 0.28,
      ease: 'power2.inOut',
      onComplete: () => {
        menu.classList.remove('burger-menu--open');
        document.body.classList.remove('page--locked');
      },
    });
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    menu.classList.add('burger-menu--open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.classList.add('menu-toggle--active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Закрити меню');
    document.body.classList.add('page--locked');

    const timeline = gsap.timeline();
    timeline
      .fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
      .fromTo(
        '.burger-menu__liquid',
        { xPercent: -35 },
        { xPercent: 0, duration: 0.65, ease: 'power3.out' },
        0,
      )
      .fromTo(
        '.burger-menu__dry',
        { xPercent: 35 },
        { xPercent: 0, duration: 0.65, ease: 'power3.out' },
        0,
      )
      .fromTo(
        links,
        { y: 22, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.38, stagger: 0.055, ease: 'power2.out' },
        0.16,
      );
  };

  toggle.addEventListener('click', () => (isOpen ? close() : open()));

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      close();

      if (target) {
        event.preventDefault();
        window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 260);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
};

