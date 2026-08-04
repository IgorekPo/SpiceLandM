import redTexture from '../assets/textures/drop-red.webp?url';
import greenTexture from '../assets/textures/drop-green.webp?url';
import goldTexture from '../assets/textures/drop-gold.webp?url';

export const loaderDrops = [
  {
    id: 'gold-drop',
    key: 'gold',
    color: '#ff9100',
    glow: 'rgba(255, 145, 0, 0.64)',
    texture: goldTexture,
    start: { x: -0.62, y: -0.18 },
    approach: { x: -0.16, y: -0.12 },
    orbit: 1,
    target: { x: -0.18, y: 0.08 },
  },
  {
    id: 'green-drop',
    key: 'green',
    color: '#6ea52b',
    glow: 'rgba(110, 165, 43, 0.62)',
    texture: greenTexture,
    start: { x: 0, y: 0.68 },
    approach: { x: 0.04, y: 0.15 },
    orbit: -1,
    target: { x: 0.18, y: 0.01 },
  },
  {
    id: 'red-drop',
    key: 'red',
    color: '#e11f21',
    glow: 'rgba(225, 31, 33, 0.66)',
    texture: redTexture,
    start: { x: 0.62, y: -0.16 },
    approach: { x: 0.16, y: -0.1 },
    orbit: 1,
    target: { x: 0, y: -0.18 },
  },
];

export const loaderDropTextures = loaderDrops.map(({ texture }) => texture);
