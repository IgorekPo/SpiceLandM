import { createCatalogPortalAnimation } from '../../animations/catalog-preview-animation.js';
import { deviceTiltNeedsPermission, enableDeviceTilt } from '../../animations/device-tilt.js';

export const initCatalogPreview = () => {
  const section = document.querySelector('[data-catalog-preview]');
  const portal = document.querySelector('[data-catalog-portal]');
  const catalog = document.querySelector('[data-catalog-shell]');
  if (!section || !portal) return;

  const track = section.querySelector('[data-catalog-track]');
  const dots = [...section.querySelectorAll('[data-catalog-dot]')];
  const enterLinks = [...section.querySelectorAll('[data-catalog-enter]')];
  const backButtons = [...portal.querySelectorAll('[data-catalog-back]')];
  const transition = createCatalogPortalAnimation(portal);
  let scrollFrame = 0;

  const updateDots = () => {
    scrollFrame = 0;
    if (!track || !dots.length) return;

    const scenes = [...track.querySelectorAll('[data-category-scene]')];
    const trackCenter = track.scrollLeft + (track.clientWidth / 2);
    let activeIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    scenes.forEach((scene, index) => {
      const sceneCenter = scene.offsetLeft + (scene.offsetWidth / 2);
      const distance = Math.abs(sceneCenter - trackCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });

    dots.forEach((dot, index) => dot.classList.toggle('catalog-preview__dot--active', index === activeIndex));
  };

  track?.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateDots);
  }, { passive: true });

  enterLinks.forEach((link) => {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      if (transition.isActive()) return;

      const tiltPermission = deviceTiltNeedsPermission() ? enableDeviceTilt() : Promise.resolve(true);

      const portalCategory = link.dataset.portalScene;
      const source = link.closest('[data-category-scene]')
        || section.querySelector(`[data-category-scene="${portalCategory}"]`);
      const entered = await transition.enter({ category: portalCategory, source, trigger: link });
      await tiltPermission;

      if (entered) {
        catalog?.dispatchEvent(new CustomEvent('catalog:open', {
          detail: { mode: link.dataset.catalogTarget },
        }));
        window.history.pushState(
          { catalogPreview: true, target: link.dataset.catalogTarget },
          '',
          link.getAttribute('href'),
        );
      }
    });
  });

  const requestReturn = () => {
    if (!transition.isActive()) return;
    catalog?.dispatchEvent(new CustomEvent('catalog:hide'));
    if (window.history.state?.catalogPreview) {
      window.history.back();
      return;
    }
    transition.leave();
  };

  backButtons.forEach((button) => button.addEventListener('click', requestReturn));
  catalog?.addEventListener('catalog:request-close', requestReturn);
  catalog?.addEventListener('catalog:background-change', (event) => {
    transition.changeCategory(event.detail.category);
  });
  window.addEventListener('popstate', () => {
    if (transition.isActive()) {
      catalog?.dispatchEvent(new CustomEvent('catalog:hide'));
      transition.leave();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && transition.isActive() && !catalog?.classList.contains('catalog--active')) requestReturn();
  });

  updateDots();
};
