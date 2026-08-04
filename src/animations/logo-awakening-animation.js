import { gsap } from 'gsap';

export const addLogoAwakeningAnimation = (timeline, {
  intro,
  brand,
  grayLogo,
  colorLogo,
  drops,
  hero,
  header,
  durationScale = 1,
}, position) => {
  const waves = intro.querySelectorAll('[data-intro-wave]');

  timeline
    .to(colorLogo, {
      autoAlpha: 1,
      clipPath: 'circle(76% at 50% 50%)',
      duration: 0.56 * durationScale,
      ease: 'power2.out',
    }, position)
    .to(grayLogo, {
      autoAlpha: 0,
      duration: 0.36 * durationScale,
      ease: 'power1.out',
    }, `${position}+=${0.18 * durationScale}`)
    .to(drops.map(({ element }) => element), {
      autoAlpha: 0,
      scale: 0.03,
      duration: 0.24 * durationScale,
      stagger: 0.045 * durationScale,
    }, position)
    .fromTo(waves,
      { scale: 0.72, autoAlpha: 0.7 },
      {
        scale: 2.55,
        autoAlpha: 0,
        duration: 0.78 * durationScale,
        stagger: 0.09 * durationScale,
        ease: 'power2.out',
      },
      `${position}+=${0.08 * durationScale}`,
    )
    .to(brand, {
      rotationY: 18,
      rotationX: -3,
      scale: 1.055,
      filter: 'drop-shadow(0 0 24px rgba(255, 145, 0, 0.48))',
      transformPerspective: 900,
      transformOrigin: '50% 50%',
      duration: 0.72 * durationScale,
      ease: 'sine.inOut',
    }, `${position}+=${0.14 * durationScale}`)
    .to(brand, {
      rotationY: 0,
      rotationX: 0,
      scale: 1,
      duration: 0.52 * durationScale,
      ease: 'sine.inOut',
    })
    .to(intro, {
      autoAlpha: 0,
      duration: 0.5 * durationScale,
      ease: 'power2.inOut',
    }, '-=0.3')
    .to([hero, header], {
      autoAlpha: 1,
      duration: 0.58 * durationScale,
      ease: 'power2.out',
    }, '<');

  return timeline;
};
