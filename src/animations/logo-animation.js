import { gsap } from 'gsap';

export const initLogoAnimation = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const logo = document.querySelector('[data-hero-logo]');
  const medallion = document.querySelector('[data-logo-medallion]');
  const glow = document.querySelector('.hero__brand-glow');
  if (!logo || !medallion || !glow) return;

  gsap.set(medallion, {
    rotationX: -6,
    rotationY: 0,
    transformOrigin: '50% 50%',
    transformPerspective: 1000,
    force3D: true,
  });

  gsap.to(medallion, {
    rotationY: '+=360',
    duration: 9,
    repeat: -1,
    ease: 'none',
  });

  gsap.to(medallion, {
    rotationX: 7,
    duration: 3.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  gsap.set(logo, { transformOrigin: '50% 50%' });
  gsap.to(logo, {
    scale: 1.018,
    duration: 3.8,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  gsap.to(glow, {
    scale: 1.22,
    opacity: 0.55,
    duration: 3.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};
