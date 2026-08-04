export const initHeader = () => {
  const logoLink = document.querySelector('.header__logo');

  logoLink?.addEventListener('click', (event) => {
    const hero = document.querySelector('#hero');
    if (!hero) return;

    event.preventDefault();
    const catalog = document.querySelector('[data-catalog-shell]');
    if (catalog?.classList.contains('catalog--active')) {
      catalog.dispatchEvent(new CustomEvent('catalog:request-close', { bubbles: true }));
      window.setTimeout(() => hero.scrollIntoView({ behavior: 'smooth', block: 'start' }), 900);
      return;
    }
    hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};
