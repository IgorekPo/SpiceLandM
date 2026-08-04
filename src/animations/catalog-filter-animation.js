import { gsap } from 'gsap';

export const animateCatalogFilter = (grid, render) => new Promise((resolve) => {
  const cards = grid.querySelectorAll('.marinade-card');
  gsap.to(cards, {
    scale: 0.96,
    autoAlpha: 0,
    duration: 0.16,
    stagger: 0.012,
    ease: 'power2.in',
    onComplete: () => {
      render();
      gsap.fromTo(grid.querySelectorAll('.marinade-card'),
        { scale: 0.96, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.26,
          stagger: 0.018,
          ease: 'power2.out',
          onComplete: resolve,
        },
      );
    },
  });
});
