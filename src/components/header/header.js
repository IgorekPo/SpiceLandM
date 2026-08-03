export const initHeader = () => {
  const logoLink = document.querySelector('.header__logo');

  logoLink?.addEventListener('click', (event) => {
    const hero = document.querySelector('#hero');
    if (!hero) return;

    event.preventDefault();
    hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

