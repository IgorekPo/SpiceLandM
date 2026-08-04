import { gsap } from 'gsap';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const initSceneAmbientMotion = (scene) => {
  const tweens = [];
  const farImage = scene.querySelector('[data-catalog-layer="0.25"] .catalog-preview__media');
  const middleImage = scene.querySelector('[data-catalog-layer="0.55"] .catalog-preview__media');
  const shimmer = scene.querySelector('[data-water-shimmer]');
  const smoke = [...scene.querySelectorAll('[data-catalog-smoke] span')];

  if (farImage) {
    tweens.push(gsap.to(farImage, {
      xPercent: 0.8,
      yPercent: -0.35,
      duration: 7.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      paused: true,
    }));
  }

  if (middleImage) {
    tweens.push(gsap.to(middleImage, {
      yPercent: -0.8,
      duration: 5.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      paused: true,
    }));
  }

  if (shimmer) {
    tweens.push(gsap.to(shimmer, {
      backgroundPositionX: 140,
      duration: 4.2,
      repeat: -1,
      ease: 'none',
      paused: true,
    }));
  }

  smoke.forEach((piece, index) => {
    tweens.push(gsap.to(piece, {
      x: index % 2 ? -18 : 16,
      y: -38 - (index * 9),
      scaleX: 1.15,
      scaleY: 1.35,
      opacity: 0.06,
      duration: 3.8 + (index * 0.7),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      paused: true,
    }));
  });

  return tweens;
};

export const initCatalogPreviewAnimation = () => {
  const section = document.querySelector('[data-catalog-preview]');
  if (!section || prefersReducedMotion()) return;

  const scenes = [...section.querySelectorAll('[data-category-scene]')];
  const contents = [...section.querySelectorAll('[data-catalog-content]')];
  const ambientTweens = scenes.flatMap(initSceneAmbientMotion);
  let contentRevealed = false;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.some((entry) => entry.isIntersecting);
    ambientTweens.forEach((tween) => (visible ? tween.play() : tween.pause()));

    if (visible && !contentRevealed) {
      contentRevealed = true;
      gsap.fromTo(contents,
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.72, stagger: 0.12, ease: 'power3.out' },
      );
    }
  }, { rootMargin: '120px 0px', threshold: 0.08 });

  observer.observe(section);

  if (!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return;

  scenes.forEach((scene) => {
    const layers = [...scene.querySelectorAll('[data-catalog-layer]')];

    const moveLayers = (x, y) => {
      layers.forEach((layer) => {
        const strength = Number(layer.dataset.catalogLayer) || 0.5;
        gsap.to(layer, {
          x: x * 10 * strength,
          y: y * 8 * strength,
          duration: 0.55,
          overwrite: 'auto',
          ease: 'power2.out',
          force3D: true,
        });
      });
    };

    scene.addEventListener('pointermove', (event) => {
      const bounds = scene.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      moveLayers(x, y);
    });

    scene.addEventListener('pointerleave', () => moveLayers(0, 0));
  });
};

export const createCatalogPortalAnimation = (portal) => {
  const portalScenes = [...portal.querySelectorAll('[data-portal-category]')];
  const backButton = portal.querySelector('[data-catalog-back]');
  const portalAmbientTweens = [];
  let activeSource = null;
  let activeTrigger = null;
  let activePortalScene = null;
  let active = false;
  let animating = false;

  if (!prefersReducedMotion()) {
    const portalShimmer = portal.querySelector('[data-portal-category="liquid"] [data-water-shimmer]');
    if (portalShimmer) {
      portalAmbientTweens.push({
        category: 'liquid',
        tween: gsap.to(portalShimmer, {
          backgroundPositionX: 160,
          duration: 4.2,
          repeat: -1,
          ease: 'none',
          paused: true,
        }),
      });
    }

    portal.querySelectorAll('[data-portal-category="dry"] [data-catalog-smoke] span').forEach((piece, index) => {
      portalAmbientTweens.push({
        category: 'dry',
        tween: gsap.to(piece, {
          x: index % 2 ? -20 : 18,
          y: -42 - (index * 10),
          scaleX: 1.18,
          scaleY: 1.4,
          opacity: 0.05,
          duration: 4 + (index * 0.7),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          paused: true,
        }),
      });
    });
  }

  const selectPortalScene = (category) => {
    portalScenes.forEach((scene) => {
      const selected = scene.dataset.portalCategory === category;
      scene.classList.toggle('catalog-portal__scene--active', selected);
      scene.setAttribute('aria-hidden', String(!selected));
    });
    activePortalScene = portalScenes.find((scene) => scene.dataset.portalCategory === category) || null;
    portalAmbientTweens.forEach(({ category: tweenCategory, tween }) => {
      if (tweenCategory === category) tween.play();
      else tween.pause(0);
    });
  };

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
    const sourceLayers = source.querySelector('.catalog-preview__layers');
    const portalLayers = activePortalScene?.querySelectorAll('.catalog-portal__layer') || [];
    const bounds = source.getBoundingClientRect();
    const originX = bounds.left + (bounds.width / 2);
    const originY = bounds.top + (bounds.height / 2);

    portal.inert = false;
    portal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('page--locked');

    if (prefersReducedMotion()) {
      gsap.set(portal, { autoAlpha: 1, pointerEvents: 'auto', clipPath: `circle(150vmax at ${originX}px ${originY}px)` });
      active = true;
      animating = false;
      backButton?.focus({ preventScroll: true });
      resolve(true);
      return;
    }

    gsap.timeline({
      onComplete: () => {
        active = true;
        animating = false;
        backButton?.focus({ preventScroll: true });
        resolve(true);
      },
    })
      .to(sourceContent, { y: -18, autoAlpha: 0, duration: 0.38, ease: 'power2.in' }, 0)
      .to(sourceLayers, { scale: 1.1, duration: 1.05, ease: 'power3.inOut' }, 0)
      .fromTo(portal,
        { autoAlpha: 0, pointerEvents: 'auto', clipPath: `circle(0% at ${originX}px ${originY}px)` },
        { autoAlpha: 1, clipPath: `circle(150vmax at ${originX}px ${originY}px)`, duration: 1.02, ease: 'power3.inOut' },
        0.18,
      )
      .fromTo(portalLayers,
        { scale: 1.18 },
        { scale: 1, duration: 1.1, stagger: 0.04, ease: 'power3.out' },
        0.18,
      );
  });

  const leave = () => new Promise((resolve) => {
    if ((!active && !animating) || !activeSource) {
      resolve(false);
      return;
    }

    animating = true;
    const sourceContent = activeSource.querySelector('[data-catalog-content]');
    const sourceLayers = activeSource.querySelector('.catalog-preview__layers');
    const portalLayers = activePortalScene?.querySelectorAll('.catalog-portal__layer') || [];
    const bounds = activeSource.getBoundingClientRect();
    const originX = bounds.left + (bounds.width / 2);
    const originY = bounds.top + (bounds.height / 2);

    const finish = () => {
      gsap.set(portal, { autoAlpha: 0, pointerEvents: 'none', clipPath: `circle(0% at ${originX}px ${originY}px)` });
      gsap.set(sourceLayers, { clearProps: 'scale' });
      gsap.set(sourceContent, { clearProps: 'transform,opacity,visibility' });
      portal.inert = true;
      portal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('page--locked');
      active = false;
      animating = false;
      activePortalScene = null;
      portalAmbientTweens.forEach(({ tween }) => tween.pause(0));
      activeSource = null;
      activeTrigger?.focus({ preventScroll: true });
      activeTrigger = null;
      resolve(true);
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    gsap.timeline({ onComplete: finish })
      .to(portalLayers, { scale: 1.13, duration: 0.72, stagger: 0.03, ease: 'power2.in' }, 0)
      .to(portal, { autoAlpha: 0, clipPath: `circle(0% at ${originX}px ${originY}px)`, duration: 0.82, ease: 'power3.inOut' }, 0.06)
      .to(sourceLayers, { scale: 1, duration: 0.84, ease: 'power3.out' }, 0.12)
      .to(sourceContent, { y: 0, autoAlpha: 1, duration: 0.48, ease: 'power2.out' }, 0.4);
  });

  return {
    enter,
    leave,
    isActive: () => active || animating,
  };
};
