import { gsap } from 'gsap';

export const DROP_PATHS = {
  idle: 'M80 4 C72 36 49 61 32 94 C13 131 20 169 46 190 C56 198 67 202 71 206 C73 213 71 226 80 237 C89 226 87 213 89 206 C93 202 104 198 114 190 C140 169 147 131 128 94 C111 61 88 36 80 4 Z',
  breathing: 'M80 8 C69 38 44 66 30 99 C14 137 23 173 48 191 C58 198 68 201 72 205 C75 213 72 226 80 235 C88 226 85 213 88 205 C92 201 102 198 112 191 C137 173 146 137 130 99 C116 66 91 38 80 8 Z',
  flying: 'M80 0 C75 27 57 51 42 83 C24 122 27 163 51 188 C61 198 71 203 75 208 C76 216 73 229 80 240 C87 229 84 216 85 208 C89 203 99 198 109 188 C133 163 136 122 118 83 C103 51 85 27 80 0 Z',
  vortex: 'M80 2 C66 30 48 54 35 88 C20 128 25 167 49 190 C59 199 70 202 74 207 C77 215 72 226 80 239 C88 226 83 215 86 207 C90 202 101 199 111 190 C135 167 140 128 125 88 C112 54 94 30 80 2 Z',
  impact: 'M80 57 C61 61 36 73 23 99 C9 127 17 151 43 166 C55 173 67 174 72 178 C76 185 73 202 80 213 C87 202 84 185 88 178 C93 174 105 173 117 166 C143 151 151 127 137 99 C124 73 99 61 80 57 Z',
};

export const setDropState = (drop, state, options = {}) => {
  const { duration = 0.28, ease = 'sine.inOut' } = options;
  drop.element.dataset.dropState = state;
  return gsap.to(drop.paths, {
    attr: { d: DROP_PATHS[state] || DROP_PATHS.idle },
    duration,
    ease,
    overwrite: 'auto',
  });
};

export const startDropIdleAnimations = (drops, { simplified = false } = {}) => drops.map((drop, index) => {
  if (simplified) return null;

  const timeline = gsap.timeline({
    repeat: -1,
    yoyo: true,
    delay: index * 0.08,
    defaults: { ease: 'sine.inOut' },
  });

  timeline
    .to(drop.paths, { attr: { d: DROP_PATHS.breathing }, duration: 0.62 + (index * 0.05) }, 0)
    .to(drop.visual, {
      rotation: drop.orbit * (2.4 + index),
      scaleX: 0.97,
      scaleY: 1.025,
      duration: 0.62 + (index * 0.05),
    }, 0);

  return timeline;
}).filter(Boolean);

export const stopDropIdleAnimations = (timelines, drops) => {
  timelines.forEach((timeline) => timeline.kill());
  gsap.set(drops.map(({ visual }) => visual), { clearProps: 'rotation,scale' });
};
