import { gsap } from 'gsap';
import { CARD_TRANSITION_DURATION } from './card-expand-animation.js';

export const createMarinadeDropTimeline = (card) => {
  const texture = card.querySelector('[data-marinade-texture]');
  const tail = card.querySelector('[data-marinade-drop-tail]');
  const bead = card.querySelector('[data-marinade-drop-bead]');
  if (!texture || !tail || !bead) return null;

  const timeline = gsap.timeline({ paused: true })
    .to(texture, {
      scaleX: 0.92,
      scaleY: 1.08,
      borderRadius: '48% 48% 44% 44%',
      duration: CARD_TRANSITION_DURATION * 0.36,
      ease: 'power2.inOut',
    })
    .to(tail, {
      autoAlpha: 1,
      scaleY: 1,
      duration: CARD_TRANSITION_DURATION * 0.62,
      ease: 'power3.in',
    }, CARD_TRANSITION_DURATION * 0.16)
    .fromTo(bead,
      { autoAlpha: 0, y: -10, scale: 0.55 },
      {
        autoAlpha: 1,
        y: 26,
        scale: 1,
        duration: CARD_TRANSITION_DURATION * 0.46,
        ease: 'power2.in',
      },
      CARD_TRANSITION_DURATION * 0.54,
    );

  return timeline;
};
