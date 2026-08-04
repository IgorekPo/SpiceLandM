import { gsap } from 'gsap';
import heroFarUrl from '../assets/images/hero-layer-far.webp?url';
import heroMiddleUrl from '../assets/images/hero-layer-middle.webp?url';
import heroFrontUrl from '../assets/images/hero-layer-front.webp?url';
import logoUrl from '../assets/logos/spiceland-logo.svg?url';
import { mountLiquidDrops } from '../components/liquid-drop/liquid-drop.js';
import { loaderDrops, loaderDropTextures } from '../data/loader-drops.js';
import {
  setDropState,
  startDropIdleAnimations,
  stopDropIdleAnimations,
} from './drop-morph-animation.js';
import { addLogoAwakeningAnimation } from './logo-awakening-animation.js';

const assetPaths = [
  ...loaderDropTextures,
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

const getMotionProfile = () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compact = window.innerWidth < 768;
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const weakDevice = compact && (memory <= 4 || cores <= 4);

  return {
    reducedMotion,
    simplified: reducedMotion || weakDevice,
    durationScale: reducedMotion ? 0.16 : compact ? 0.78 : 1,
  };
};

const revealWithoutMotion = async ({ intro, header, hero, grayLogo, colorLogo }) => {
  await preloadAssets();

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
        clipPath: 'circle(76% at 50% 50%)',
        duration: 0.12,
      })
      .to(grayLogo, { autoAlpha: 0, duration: 0.1 }, '<')
      .to(intro, { autoAlpha: 0, duration: 0.12, delay: 0.08 })
      .to([hero, header], { autoAlpha: 1, duration: 0.12 }, '<');
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

  const stage = intro.querySelector('[data-liquid-stage]');
  const collision = intro.querySelector('[data-liquid-collision]');
  const brand = intro.querySelector('[data-intro-brand]');
  const grayLogo = intro.querySelector('[data-intro-gray]');
  const colorLogo = intro.querySelector('[data-intro-color]');
  const drops = mountLiquidDrops(stage, loaderDrops);
  const motion = getMotionProfile();

  gsap.set([header, hero], { autoAlpha: 0 });
  gsap.set(colorLogo, { autoAlpha: 0, clipPath: 'circle(0% at 50% 50%)' });

  if (motion.reducedMotion || drops.length !== loaderDrops.length) {
    return revealWithoutMotion({ intro, header, hero, grayLogo, colorLogo });
  }

  await Promise.all(loaderDropTextures.map((path) => {
    const image = new Image();
    image.src = path;
    return image.decode?.().catch(() => undefined) ?? Promise.resolve();
  }));

  const preload = preloadAssets();
  const logoBounds = grayLogo.getBoundingClientRect();
  const viewportCenterY = window.innerHeight / 2;
  const logoCenterY = logoBounds.top + (logoBounds.height / 2);
  const logoOffsetY = logoCenterY - viewportCenterY;
  const collisionY = logoOffsetY - Math.min(72, logoBounds.height * 0.54);
  const travelX = Math.min(window.innerWidth * 0.62, 820);
  const travelY = Math.min(window.innerHeight * 0.68, 650);
  const approachRadius = Math.min(window.innerWidth * 0.15, 150);
  const orbitRadiusX = Math.min(window.innerWidth * 0.12, 118);
  const orbitRadiusY = Math.min(window.innerHeight * 0.11, 94);

  drops.forEach((drop) => {
    gsap.set(drop.element, {
      x: drop.start.x * travelX,
      y: drop.start.y * travelY,
      rotation: drop.orbit * -24,
      scale: 0.68,
      autoAlpha: 0,
      transformOrigin: '50% 50%',
      force3D: true,
    });
  });

  gsap.set(collision, {
    y: collisionY,
    scale: 0.12,
    autoAlpha: 0,
    transformOrigin: '50% 50%',
  });

  const idleTimelines = startDropIdleAnimations(drops, { simplified: motion.simplified });
  const duration = motion.durationScale;

  return new Promise((resolve) => {
    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: async () => {
        await preload;
        stopDropIdleAnimations(idleTimelines, drops);
        document.body.classList.remove('page--loading');
        intro.remove();
        resolve();
      },
    });

    timeline
      .to(drops.map(({ element }) => element), {
        autoAlpha: 1,
        duration: 0.22 * duration,
        stagger: 0.045 * duration,
      }, 0)
      .call(() => {
        stopDropIdleAnimations(idleTimelines, drops);
        drops.forEach((drop) => setDropState(drop, 'flying', { duration: 0.24 * duration }));
      }, null, 0.1 * duration);

    drops.forEach((drop) => {
      timeline.to(drop.element, {
        x: drop.approach.x * approachRadius,
        y: collisionY + (drop.approach.y * approachRadius),
        rotation: drop.orbit * 96,
        scaleX: 0.78,
        scaleY: 1.2,
        duration: 1.36 * duration,
        ease: 'power3.in',
      }, 0.18 * duration);
    });

    timeline.addLabel('vortex', `>${-0.04 * duration}`)
      .call(() => drops.forEach((drop) => setDropState(drop, 'vortex', {
        duration: 0.2 * duration,
      })), null, 'vortex');

    timeline.addLabel('vortex-mid', `vortex+=${0.46 * duration}`);
    drops.forEach((drop, index) => {
      const angle = ((index * 120) - 90) * (Math.PI / 180);
      const nextAngle = angle + (drop.orbit * Math.PI * 0.82);
      timeline
        .to(drop.element, {
          x: Math.cos(angle) * orbitRadiusX,
          y: collisionY + (Math.sin(angle) * orbitRadiusY),
          rotation: `+=${drop.orbit * 150}`,
          scaleX: 0.72,
          scaleY: 1.24,
          duration: 0.46 * duration,
          ease: 'sine.inOut',
        }, 'vortex')
        .to(drop.element, {
          x: Math.cos(nextAngle) * orbitRadiusX * 0.58,
          y: collisionY + (Math.sin(nextAngle) * orbitRadiusY * 0.58),
          rotation: `+=${drop.orbit * 155}`,
          scaleX: 0.82,
          scaleY: 1.15,
          duration: 0.44 * duration,
          ease: 'sine.inOut',
        }, 'vortex-mid');
    });

    timeline.addLabel('impact', `>${-0.02 * duration}`)
      .call(() => drops.forEach((drop) => setDropState(drop, 'impact', {
        duration: 0.16 * duration,
        ease: 'back.out(1.8)',
      })), null, 'impact')
      .to(drops.map(({ element }) => element), {
        x: 0,
        y: collisionY,
        rotation: 0,
        scaleX: 1.34,
        scaleY: 0.58,
        filter: 'brightness(1.28)',
        duration: 0.2 * duration,
        ease: 'back.out(2.1)',
      }, 'impact')
      .to(collision, {
        scale: 1.35,
        autoAlpha: 0.92,
        duration: 0.2 * duration,
        ease: 'back.out(2)',
      }, 'impact')
      .to(drops.map(({ element }) => element), {
        scaleX: 0.18,
        scaleY: 0.18,
        filter: 'brightness(1.1)',
        duration: 0.3 * duration,
        ease: 'back.inOut(1.7)',
      })
      .to(collision, {
        scale: 0.3,
        autoAlpha: 0,
        duration: 0.28 * duration,
      }, '<');

    timeline.addLabel('landing');
    drops.forEach((drop, index) => {
      timeline.to(drop.element, {
        x: drop.target.x * logoBounds.width,
        y: logoOffsetY + (drop.target.y * logoBounds.height),
        rotation: drop.orbit * 22,
        scale: 0.075,
        duration: 0.54 * duration,
        delay: index * 0.035 * duration,
        ease: 'power2.in',
      }, 'landing');
    });

    timeline.addLabel('awaken', `>${-0.04 * duration}`);
    addLogoAwakeningAnimation(timeline, {
      intro,
      brand,
      grayLogo,
      colorLogo,
      drops,
      hero,
      header,
      durationScale: duration,
    }, 'awaken');
  });
};
