import { gsap } from 'gsap';

export const expandCard = (card, dropTimeline) => new Promise((resolve) => {
  const expandable = card.querySelector('[data-card-expandable]');
  const gallery = card.querySelector('[data-marinade-gallery]');
  const info = card.querySelector('[data-card-info]');
  if (!expandable) {
    resolve();
    return;
  }

  expandable.hidden = false;
  card.classList.add('marinade-card--expanded');
  const startHeight = card.offsetHeight;
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
    .to(card, { height: endHeight, duration: 0.58, ease: 'power3.inOut' })
    .call(() => dropTimeline?.restart(), null, 0.08)
    .fromTo(gallery,
      { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' },
      { autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.42, ease: 'power2.out' },
      0.56,
    )
    .fromTo(info, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.36 }, 0.72);
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
      gsap.set([card, gallery, info], { clearProps: 'all' });
      resolve();
    },
  })
    .to(info, { y: 10, autoAlpha: 0, duration: 0.18 }, 0)
    .to(gallery, { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)', duration: 0.25 }, 0.08)
    .call(() => dropTimeline?.reverse(), null, 0.08)
    .to(card, { height: closedHeight, duration: 0.48, ease: 'power3.inOut' }, 0.18);
});
