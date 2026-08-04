import { gsap } from 'gsap';

export const animateCatalogFilter = (grid, render) => new Promise((resolve) => {
  const cards = grid.querySelectorAll('.marinade-card');
  gsap.to(cards, {
    scale: 0.96,
    autoAlpha: 0,
    duration: 0.22,
    stagger: 0.025,
    ease: 'power2.in',
    onComplete: () => {
      render();
      gsap.fromTo(grid.querySelectorAll('.marinade-card'),
        { scale: 0.96, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.38,
          stagger: 0.035,
          ease: 'power2.out',
          onComplete: resolve,
        },
      );
    },
  });
});
