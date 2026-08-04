import { gsap } from 'gsap';
import {
  deviceTiltNeedsPermission,
  enableDeviceTilt,
  subscribeDeviceTilt,
  supportsDeviceTilt,
} from './device-tilt.js';

export const initHeroParallax = () => {
  const hero = document.querySelector('[data-hero]');
  const layers = [...document.querySelectorAll('[data-parallax-layer]')];
  const permissionButton = document.querySelector('[data-orientation-permission]');

  if (!hero || !layers.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const lowPowerDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);

  let fallbackStarted = false;

  const startFallback = () => {
    if (fallbackStarted) return;
    fallbackStarted = true;

    layers.forEach((layer, index) => {
      if (index === 0 && lowPowerDevice) return;
      const strength = Number(layer.dataset.parallaxLayer) || 0.5;
      gsap.to(layer, {
        xPercent: strength * 0.7,
        yPercent: strength * 0.45,
        duration: 4.8 + index,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
  };

  const moveLayers = (x, y) => {
    layers.forEach((layer) => {
      const strength = Number(layer.dataset.parallaxLayer) || 0.5;
      gsap.to(layer, {
        x: x * 18 * strength,
        y: y * 12 * strength,
        duration: lowPowerDevice ? 0.8 : 0.45,
        overwrite: 'auto',
        ease: 'power2.out',
        force3D: true,
      });
    });
  };

  if (window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches && !lowPowerDevice) {
    hero.addEventListener('pointermove', (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      moveLayers(x, y);
    });

    hero.addEventListener('pointerleave', () => moveLayers(0, 0));
    return;
  }

  let tiltReceived = false;
  subscribeDeviceTilt(({ x, y }) => {
    tiltReceived = true;
    moveLayers(x, y);
  });

  if (!supportsDeviceTilt()) {
    startFallback();
    return;
  }

  if (deviceTiltNeedsPermission()) {
    permissionButton.hidden = false;
    permissionButton.addEventListener('click', async () => {
      const enabled = await enableDeviceTilt();
      permissionButton.hidden = true;
      if (!enabled) startFallback();
    }, { once: true });
  } else {
    window.setTimeout(() => {
      if (!tiltReceived) startFallback();
    }, 1200);
  }
};
