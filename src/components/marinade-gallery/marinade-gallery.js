export const initializeMarinadeGallery = (card, product, lightbox) => {
  const track = card.querySelector('[data-gallery-track]');
  const slides = [...card.querySelectorAll('[data-gallery-image]')];
  const dots = [...card.querySelectorAll('[data-gallery-dot]')];
  const previous = card.querySelector('[data-gallery-prev]');
  const next = card.querySelector('[data-gallery-next]');
  if (!track || !slides.length) return;

  let activeIndex = 0;
  let scrollFrame = 0;

  const setActive = (index, behavior = 'smooth') => {
    activeIndex = (index + slides.length) % slides.length;
    slides[activeIndex].scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activeIndex));
  };

  const updateFromScroll = () => {
    scrollFrame = 0;
    const trackCenter = track.scrollLeft + (track.clientWidth / 2);
    let closest = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const distance = Math.abs((slide.offsetLeft + (slide.offsetWidth / 2)) - trackCenter);
      if (distance < closest) {
        closest = distance;
        activeIndex = index;
      }
    });
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
  };

  previous?.addEventListener('click', () => setActive(activeIndex - 1));
  next?.addEventListener('click', () => setActive(activeIndex + 1));
  slides.forEach((slide, index) => slide.addEventListener('click', () => lightbox.open({
    images: product.dishImages,
    alts: product.dishImages.map((_, imageIndex) => `Готова страва з маринадом «${product.name}» — фото ${imageIndex + 1}`),
    index,
  })));
  track.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateFromScroll);
  }, { passive: true });
};
