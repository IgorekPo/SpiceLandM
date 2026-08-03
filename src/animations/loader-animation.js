import { gsap } from 'gsap';
import heroFarUrl from '../assets/images/hero-layer-far.png?url';
import heroMiddleUrl from '../assets/images/hero-layer-middle.png?url';
import heroFrontUrl from '../assets/images/hero-layer-front.png?url';
import logoUrl from '../assets/logos/logo.svg?url';

const assetPaths = [
  heroFarUrl,
  heroMiddleUrl,
  heroFrontUrl,
  logoUrl,
];

const preloadAssets = () => Promise.all(
  assetPaths.map((path) => {
    const image = new Image();
    image.src = path;
    return image.decode?.().catch(() => undefined) ?? Promise.resolve();
  }),
);

const startLiquidMorphs = (intro) => {
  const configs = [
    { key: 'orange', direction: 1, duration: 0.24 },
    { key: 'green', direction: -1, duration: 0.28 },
    { key: 'red', direction: 1, duration: 0.26 },
  ];

  return configs.flatMap(({ key, direction, duration }) => {
    const body = intro.querySelector(`[data-liquid-body="${key}"]`);
    if (!body) return [];

    const morph = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });
    morph
      .to(body, {
        skewX: 11 * direction,
        skewY: -3 * direction,
        scaleX: 0.91,
        scaleY: 1.08,
        x: 7 * direction,
        duration,
      })
      .to(body, {
        skewX: -14 * direction,
        skewY: 4 * direction,
        scaleX: 1.08,
        scaleY: 0.93,
        x: -9 * direction,
        duration: duration * 1.2,
      })
      .to(body, {
        skewX: 8 * direction,
        skewY: 2 * direction,
        scaleX: 0.95,
        scaleY: 1.05,
        x: 5 * direction,
        duration,
      })
      .to(body, {
        skewX: 0,
        skewY: 0,
        scaleX: 1,
        scaleY: 1,
        x: 0,
        duration: duration * 0.9,
      });

    return [morph];
  });
};

export const playIntroAnimation = async () => {
  const intro = document.querySelector('[data-intro]');
  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('[data-hero]');

  if (!intro || !header || !hero) return;

  const skipIntroForDevPreview = import.meta.env.DEV
    && new URLSearchParams(window.location.search).has('skipIntro');

  if (skipIntroForDevPreview) {
    document.body.classList.remove('page--loading');
    gsap.set([header, hero], { autoAlpha: 1 });
    intro.remove();
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preload = preloadAssets();

  const orange = intro.querySelector('[data-liquid="orange"]');
  const green = intro.querySelector('[data-liquid="green"]');
  const red = intro.querySelector('[data-liquid="red"]');
  const liquids = [orange, green, red];
  const collision = intro.querySelector('[data-liquid-collision]');
  const grayLogo = intro.querySelector('[data-intro-gray]');
  const colorLogo = intro.querySelector('[data-intro-color]');

  gsap.set([header, hero], { autoAlpha: 0 });
  gsap.set(colorLogo, { autoAlpha: 0, clipPath: 'circle(0% at 50% 50%)' });
  const logoBounds = grayLogo.getBoundingClientRect();
  const logoCenterY = logoBounds.top + (logoBounds.height / 2);
  const viewportCenterY = window.innerHeight / 2;
  const logoOffsetY = logoCenterY - viewportCenterY;
  const collisionOffsetY = logoOffsetY - Math.min(56, logoBounds.height * 0.4);
  const landingX = logoBounds.width * 0.17;
  const landingY = logoBounds.height * 0.12;

  gsap.set(collision, {
    y: collisionOffsetY,
    scale: 0.15,
    autoAlpha: 0,
    transformOrigin: '50% 50%',
  });

  if (prefersReducedMotion) {
    await preload;

    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: () => {
          document.body.classList.remove('page--loading');
          intro.remove();
          resolve();
        },
      })
        .to(colorLogo, {
          autoAlpha: 1,
          clipPath: 'circle(75% at 50% 50%)',
          duration: prefersReducedMotion ? 0.12 : 0.5,
        })
        .to(grayLogo, { autoAlpha: 0, duration: 0.2 }, '<')
        .to(intro, { autoAlpha: 0, duration: prefersReducedMotion ? 0.12 : 0.45, delay: 0.2 })
        .to([hero, header], { autoAlpha: 1, duration: prefersReducedMotion ? 0.12 : 0.5 }, '<');
    });
  }

  const horizontalDistance = Math.min(window.innerWidth * 0.58, 760);
  const verticalDistance = Math.min(window.innerHeight * 0.62, 620);

  gsap.set(orange, { x: -horizontalDistance, y: -verticalDistance * 0.2, scale: 0.82, autoAlpha: 0 });
  gsap.set(green, { x: 0, y: verticalDistance, scale: 0.82, autoAlpha: 0 });
  gsap.set(red, { x: horizontalDistance, y: -verticalDistance * 0.18, scale: 0.82, autoAlpha: 0 });

  const liquidMorphs = startLiquidMorphs(intro);

  return new Promise((resolve) => {
    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: async () => {
        await preload;
        liquidMorphs.forEach((tween) => tween.kill());
        document.body.classList.remove('page--loading');
        intro.remove();
        resolve();
      },
    });

    timeline
      .to(orange, { x: 0, y: collisionOffsetY, autoAlpha: 1, duration: 3, ease: 'power3.in' }, 0)
      .to(green, { x: 0, y: collisionOffsetY, autoAlpha: 1, duration: 3, ease: 'power3.in' }, 0)
      .to(red, { x: 0, y: collisionOffsetY, autoAlpha: 1, duration: 3, ease: 'power3.in' }, 0)
      .to(liquids, {
        scale: 1.08,
        filter: 'brightness(1.3) blur(0.4px)',
        duration: 0.16,
        ease: 'back.out(2)',
      })
      .to(collision, {
        scale: 1.45,
        autoAlpha: 0.96,
        duration: 0.24,
        ease: 'back.out(2.2)',
      }, '<')
      .to(liquids, {
        x: 0,
        y: collisionOffsetY - 22,
        scale: 0.18,
        duration: 0.28,
        ease: 'back.inOut(1.8)',
      })
      .to(collision, { scale: 0.35, autoAlpha: 0, duration: 0.28 }, '<')
      .to(orange, { x: -landingX, y: logoOffsetY + landingY, scale: 0.09, duration: 0.5, ease: 'bounce.out' })
      .to(green, { x: 0, y: logoOffsetY - landingY, scale: 0.085, duration: 0.5, ease: 'bounce.out' }, '<')
      .to(red, { x: landingX, y: logoOffsetY - (landingY * 0.65), scale: 0.09, duration: 0.5, ease: 'bounce.out' }, '<')
      .to(colorLogo, {
        autoAlpha: 1,
        clipPath: 'circle(75% at 50% 50%)',
        duration: 0.58,
        ease: 'power2.out',
      }, '-=0.08')
      .to(grayLogo, { autoAlpha: 0, duration: 0.32 }, '-=0.32')
      .to(liquids, { autoAlpha: 0, duration: 0.22 }, '<')
      .to('[data-intro-brand]', {
        scale: 1.035,
        duration: 0.42,
        ease: 'sine.inOut',
      }, '-=0.18')
      .fromTo('[data-intro-wave]',
        { scale: 0.8, autoAlpha: 0.55 },
        { scale: 2.4, autoAlpha: 0, duration: 0.72, stagger: 0.1, ease: 'power2.out' },
        '-=0.16',
      )
      .to(intro, { autoAlpha: 0, duration: 0.55, ease: 'power2.inOut' }, '-=0.48')
      .to(hero, { autoAlpha: 1, duration: 0.62, ease: 'power2.out' }, '<')
      .fromTo('[data-hero-logo]',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.55, ease: 'power3.out' },
        '-=0.38',
      )
      .fromTo('[data-hero-copy]',
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.44',
      )
      .fromTo('[data-hero-actions]',
        { x: -18, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.52, ease: 'power3.out' },
        '-=0.48',
      )
      .fromTo(header,
        { y: -18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.48, ease: 'power2.out' },
        '-=0.42',
      );
  });
};
