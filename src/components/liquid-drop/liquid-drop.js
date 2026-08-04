import { DROP_PATHS } from '../../animations/drop-morph-animation.js';

const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';

export const mountLiquidDrops = (stage, drops) => {
  const template = document.querySelector('[data-liquid-drop-template]');
  if (!stage || !template) return [];

  stage.replaceChildren();

  return drops.map((drop) => {
    const fragment = template.content.cloneNode(true);
    const element = fragment.querySelector('[data-liquid-drop]');
    const clip = fragment.querySelector('[data-drop-clip]');
    const texture = fragment.querySelector('[data-drop-texture]');
    const paths = [...fragment.querySelectorAll('[data-drop-path]')];
    const visual = fragment.querySelector('[data-drop-visual]');
    const clipId = `liquid-drop-clip-${drop.id}`;

    element.dataset.dropId = drop.id;
    element.dataset.dropColor = drop.key;
    element.style.setProperty('--liquid-drop-color', drop.color);
    element.style.setProperty('--liquid-drop-glow', drop.glow);
    clip.id = clipId;
    paths.forEach((path) => path.setAttribute('d', DROP_PATHS.idle));
    texture.setAttribute('href', drop.texture);
    texture.setAttributeNS(XLINK_NAMESPACE, 'href', drop.texture);
    texture.setAttribute('clip-path', `url(#${clipId})`);
    stage.append(fragment);

    return {
      ...drop,
      element,
      paths,
      visual,
    };
  });
};
