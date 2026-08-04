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
import { initCartModal } from '../components/cart-modal/cart-modal.js';
import { initHero } from '../sections/hero/hero.js';
import { initCatalogPreview } from '../sections/catalog-preview/catalog-preview.js';

let catalogPreparation = null;
const prepareCatalog = () => {
  if (!catalogPreparation) {
    catalogPreparation = import('../sections/catalog/catalog.js')
      .then(({ initializeCatalog }) => initializeCatalog());
  }
  return catalogPreparation;
};

initHeader();
initBurgerMenu();
initHero();
initCatalogPreview({ prepareCatalog });
initSectionScroll();

const successModal = initSuccessModal();
const contactModal = initContactModal({ onSuccess: successModal.open });
initCartModal({ openContact: contactModal?.open });

playIntroAnimation().then(() => {
  initLogoAnimation();
  initHeroParallax();
  initCatalogPreviewAnimation();
});
