import { gsap } from 'gsap';

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

  const handleOrientation = (event) => {
    const x = Math.max(-1, Math.min(1, (event.gamma || 0) / 35));
    const y = Math.max(-1, Math.min(1, ((event.beta || 45) - 45) / 35));
    moveLayers(x, y);
  };

  if (typeof DeviceOrientationEvent === 'undefined' || lowPowerDevice) {
    startFallback();
    return;
  }

  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    permissionButton.hidden = false;
    permissionButton.addEventListener('click', async () => {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, { passive: true });
          permissionButton.hidden = true;
        } else {
          permissionButton.hidden = true;
          startFallback();
        }
      } catch {
        permissionButton.hidden = true;
        startFallback();
      }
    }, { once: true });
  } else {
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    window.setTimeout(startFallback, 1200);
  }
};

