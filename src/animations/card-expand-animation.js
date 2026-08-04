import { gsap } from 'gsap';

export const CARD_TRANSITION_DURATION = 0.56;

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
  dropTimeline?.restart();

  const timeline = gsap.timeline({
    onComplete: () => {
      gsap.set(card, { clearProps: 'height' });
      resolve();
    },
  });

  timeline
    .to(card, { height: endHeight, duration: CARD_TRANSITION_DURATION, ease: 'power3.inOut' }, 0)
    .fromTo(gallery,
      { y: 8, autoAlpha: 0, clipPath: 'inset(0 0 18% 0)' },
      { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: CARD_TRANSITION_DURATION, ease: 'power2.out' },
      0,
    )
    .fromTo(info, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: CARD_TRANSITION_DURATION, ease: 'power2.out' }, 0);
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
  dropTimeline?.reverse();

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
    .to(card, { height: closedHeight, duration: CARD_TRANSITION_DURATION, ease: 'power3.inOut' }, 0);
});
