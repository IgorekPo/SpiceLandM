import { gsap } from 'gsap';

export const expandCard = (card, dropTimeline) => new Promise((resolve) => {
  const expandable = card.querySelector('[data-card-expandable]');
  const gallery = card.querySelector('[data-marinade-gallery]');
  const info = card.querySelector('[data-card-info]');
  if (!expandable) {
    resolve();
    return;
  }

  const startHeight = card.offsetHeight;
  expandable.hidden = false;
  card.classList.add('marinade-card--expanded');
  gsap.set(card, { height: 'auto' });
  const endHeight = card.offsetHeight;
  gsap.set(card, { height: startHeight });

  const timeline = gsap.timeline({
    onComplete: () => {
      gsap.set(card, { clearProps: 'height' });
      resolve();
    },
  });

  timeline
    .to(card, { height: endHeight, duration: 0.52, ease: 'power3.inOut' }, 0)
    .call(() => dropTimeline?.restart(), null, 0.04)
    .fromTo(gallery,
      { y: 8, autoAlpha: 0, clipPath: 'inset(0 0 18% 0)' },
      { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.46, ease: 'power2.out' },
      0.04,
    )
    .fromTo(info, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.46, ease: 'power2.out' }, 0.04);
});

export const collapseCard = (card, dropTimeline) => new Promise((resolve) => {
  const expandable = card.querySelector('[data-card-expandable]');
  const gallery = card.querySelector('[data-marinade-gallery]');
  const info = card.querySelector('[data-card-info]');
  if (!expandable) {
    resolve();
    return;
  }

  const startHeight = card.offsetHeight;
  const closedHeight = Number(card.dataset.closedHeight) || 286;
  gsap.set(card, { height: startHeight });

  gsap.timeline({
    onComplete: () => {
      card.classList.remove('marinade-card--expanded');
      expandable.hidden = true;
      gsap.set(card, { clearProps: 'height' });
      gsap.set([gallery, info], { clearProps: 'all' });
      resolve();
    },
  })
    .to(info, { y: 7, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0)
    .to(gallery, { y: 7, autoAlpha: 0, clipPath: 'inset(0 0 18% 0)', duration: 0.3, ease: 'power2.in' }, 0)
    .call(() => dropTimeline?.reverse(), null, 0.02)
    .to(card, { height: closedHeight, duration: 0.46, ease: 'power3.inOut' }, 0);
});
