export const initializeImageLightbox = () => {
  const lightbox = document.querySelector('[data-image-lightbox]');
  if (!lightbox) return { open: () => {} };

  const image = lightbox.querySelector('[data-lightbox-image]');
  const closeButton = lightbox.querySelector('[data-lightbox-close]');
  const previous = lightbox.querySelector('[data-lightbox-prev]');
  const next = lightbox.querySelector('[data-lightbox-next]');
  const counter = lightbox.querySelector('[data-lightbox-counter]');
  let images = [];
  let alts = [];
  let activeIndex = 0;
  let touchStartX = 0;

  const render = () => {
    image.src = images[activeIndex];
    image.alt = alts[activeIndex] || '';
    counter.textContent = `${activeIndex + 1} / ${images.length}`;
  };

  const go = (step) => {
    activeIndex = (activeIndex + step + images.length) % images.length;
    render();
  };

  const close = () => {
    lightbox.classList.remove('image-lightbox--active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.inert = true;
    document.body.classList.remove('page--lightbox-locked');
  };

  const open = ({ images: sources, alts: labels, index = 0 }) => {
    images = sources;
    alts = labels;
    activeIndex = index;
    render();
    lightbox.inert = false;
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('image-lightbox--active');
    document.body.classList.add('page--lightbox-locked');
    closeButton.focus({ preventScroll: true });
  };

  closeButton.addEventListener('click', close);
  previous.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });
  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 48) go(distance > 0 ? -1 : 1);
  }, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('image-lightbox--active')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') go(-1);
    if (event.key === 'ArrowRight') go(1);
  });

  return { open, close };
};
