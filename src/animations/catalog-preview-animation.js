import { gsap } from 'gsap';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const usesTouchTransition = () => window.matchMedia(
  '(max-width: 1023px), (hover: none), (pointer: coarse)',
).matches;
const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

export const initCatalogPreviewAnimation = () => {
  const section = document.querySelector('[data-catalog-preview]');
  if (!section || prefersReducedMotion()) return;

  const contents = [...section.querySelectorAll('[data-catalog-content]')];
  let contentRevealed = false;

  const observer = new IntersectionObserver((entries) => {
    if (contentRevealed || !entries.some((entry) => entry.isIntersecting)) return;
    contentRevealed = true;
    gsap.fromTo(contents,
      { y: 28, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.72, stagger: 0.12, ease: 'power3.out' },
    );
    observer.disconnect();
  }, { rootMargin: '120px 0px', threshold: 0.08 });

  observer.observe(section);
};

export const createCatalogPortalAnimation = (portal) => {
  const portalScenes = [...portal.querySelectorAll('[data-portal-category]')];
  const backButton = portal.querySelector('[data-catalog-back]');
  const touchTransition = usesTouchTransition();
  let activeSource = null;
  let activeTrigger = null;
  let activePortalScene = null;
  let active = false;
  let animating = false;

  const selectPortalScene = (category) => {
    portalScenes.forEach((scene) => {
      const selected = scene.dataset.portalCategory === category;
      scene.classList.toggle('catalog-portal__scene--active', selected);
      scene.setAttribute('aria-hidden', String(!selected));
      scene.style.removeProperty('opacity');
    });
    activePortalScene = portalScenes.find((scene) => scene.dataset.portalCategory === category) || null;
  };

  const changeCategory = (category) => new Promise((resolve) => {
    const nextScene = portalScenes.find((scene) => scene.dataset.portalCategory === category);
    if (!active || !nextScene || nextScene === activePortalScene) {
      resolve(false);
      return;
    }

    const previousScene = activePortalScene;
    nextScene.classList.add('catalog-portal__scene--active');
    nextScene.setAttribute('aria-hidden', 'false');
    nextScene.style.opacity = '0';

    window.requestAnimationFrame(() => {
      previousScene?.style.setProperty('opacity', '0');
      nextScene.style.opacity = '1';
    });

    wait(prefersReducedMotion() ? 0 : 360).then(() => {
      previousScene?.classList.remove('catalog-portal__scene--active');
      previousScene?.setAttribute('aria-hidden', 'true');
      previousScene?.style.removeProperty('opacity');
      nextScene.style.removeProperty('opacity');
      activePortalScene = nextScene;
      resolve(true);
    });
  });

  const enter = ({ category, source, trigger }) => new Promise((resolve) => {
    if (active || animating || !source) {
      resolve(false);
      return;
    }

    animating = true;
    activeSource = source;
    activeTrigger = trigger;
    selectPortalScene(category);

    const sourceContent = source.querySelector('[data-catalog-content]');
    const bounds = source.getBoundingClientRect();
    const originX = bounds.left + (bounds.width / 2);
    const originY = bounds.top + (bounds.height / 2);

    portal.inert = false;
    portal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('page--locked');

    const finish = () => {
      active = true;
      animating = false;
      backButton?.focus({ preventScroll: true });
      resolve(true);
    };

    if (touchTransition) {
      portal.classList.add('catalog-portal--touch-visible');
      wait(prefersReducedMotion() ? 0 : 400).then(finish);
      return;
    }

    if (prefersReducedMotion()) {
      gsap.set(portal, { autoAlpha: 1, pointerEvents: 'auto', clipPath: 'none' });
      finish();
      return;
    }

    gsap.timeline({ onComplete: finish })
      .to(sourceContent, { y: -18, autoAlpha: 0, duration: 0.38, ease: 'power2.in' }, 0)
      .fromTo(portal,
        { autoAlpha: 0, pointerEvents: 'auto', clipPath: `circle(0% at ${originX}px ${originY}px)` },
        { autoAlpha: 1, clipPath: `circle(150vmax at ${originX}px ${originY}px)`, duration: 0.92, ease: 'power3.inOut' },
        0.12,
      );
  });

  const leave = () => new Promise((resolve) => {
    if ((!active && !animating) || !activeSource) {
      resolve(false);
      return;
    }

    animating = true;
    const sourceContent = activeSource.querySelector('[data-catalog-content]');
    const bounds = activeSource.getBoundingClientRect();
    const originX = bounds.left + (bounds.width / 2);
    const originY = bounds.top + (bounds.height / 2);

    const finish = () => {
      portal.classList.remove('catalog-portal--touch-visible');
      if (!touchTransition) {
        gsap.set(portal, { autoAlpha: 0, pointerEvents: 'none', clipPath: `circle(0% at ${originX}px ${originY}px)` });
        gsap.set(sourceContent, { clearProps: 'transform,opacity,visibility' });
      }
      portalScenes.forEach((scene) => scene.style.removeProperty('opacity'));
      portal.inert = true;
      portal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('page--locked');
      active = false;
      animating = false;
      activePortalScene = null;
      activeSource = null;
      activeTrigger?.focus({ preventScroll: true });
      activeTrigger = null;
      resolve(true);
    };

    if (touchTransition) {
      portal.classList.remove('catalog-portal--touch-visible');
      wait(prefersReducedMotion() ? 0 : 400).then(finish);
      return;
    }

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    gsap.set(portal, { clipPath: `circle(150vmax at ${originX}px ${originY}px)` });
    gsap.timeline({ onComplete: finish })
      .to(portal, { autoAlpha: 0, clipPath: `circle(0% at ${originX}px ${originY}px)`, duration: 0.72, ease: 'power3.inOut' }, 0)
      .to(sourceContent, { y: 0, autoAlpha: 1, duration: 0.44, ease: 'power2.out' }, 0.3);
  });

  return {
    enter,
    leave,
    changeCategory,
    isActive: () => active || animating,
  };
};
