import { gsap } from 'gsap';

export const createMarinadeDropTimeline = (card) => {
  const texture = card.querySelector('[data-marinade-texture]');
  const tail = card.querySelector('[data-marinade-drop-tail]');
  const bead = card.querySelector('[data-marinade-drop-bead]');
  if (!texture || !tail || !bead) return null;

  return gsap.timeline({ paused: true })
    .to(texture, {
      scaleX: 0.92,
      scaleY: 1.08,
      borderRadius: '48% 48% 44% 44%',
      duration: 0.24,
      ease: 'power2.inOut',
    })
    .to(tail, {
      autoAlpha: 1,
      scaleY: 1,
      duration: 0.42,
      ease: 'power3.in',
    }, 0.12)
    .fromTo(bead,
      { autoAlpha: 0, y: -10, scale: 0.55 },
      { autoAlpha: 1, y: 26, scale: 1, duration: 0.38, ease: 'power2.in' },
      0.34,
    );
};
