import '../styles/main.scss';

import { playIntroAnimation } from '../animations/loader-animation.js';
import { initLogoAnimation } from '../animations/logo-animation.js';
import { initHeroParallax } from '../animations/hero-parallax.js';
import { initCatalogPreviewAnimation } from '../animations/catalog-preview-animation.js';
import { initSectionScroll } from '../animations/section-scroll.js';
import { initHeader } from '../components/header/header.js';
import { initBurgerMenu } from '../components/burger-menu/burger-menu.js';
import { initContactModal } from '../components/contact-modal/contact-modal.js';
import { initSuccessModal } from '../components/success-modal/success-modal.js';
import { initHero } from '../sections/hero/hero.js';
import { initCatalogPreview } from '../sections/catalog-preview/catalog-preview.js';

initHeader();
initBurgerMenu();
initHero();
initCatalogPreview();
initCatalogPreviewAnimation();
initSectionScroll();

const successModal = initSuccessModal();
initContactModal({ onSuccess: successModal.open });

playIntroAnimation().then(() => {
  initLogoAnimation();
  initHeroParallax();
});
