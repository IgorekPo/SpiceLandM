import { gsap } from 'gsap';
import { marinades } from '../../data/marinades.js';
import { createMarinadeCard, initializeMarinadeCard } from '../../components/marinade-card/marinade-card.js';
import { initializeCatalogFilter } from '../../components/catalog-filter/catalog-filter.js';
import { initializeImageLightbox } from '../../components/image-lightbox/image-lightbox.js';
import { animateCatalogFilter } from '../../animations/catalog-filter-animation.js';
import { requestCatalogBackground } from '../../animations/catalog-background-transition.js';
import { getCartSummary } from '../../js/cart-store.js';

const modeMeta = {
  liquid: { title: 'Каталог <span>рідких</span> маринадів', opposite: 'Каталог сухих маринадів', next: 'dry' },
  dry: { title: 'Каталог <span>сухих</span> маринадів', opposite: 'Каталог рідких маринадів', next: 'liquid' },
  all: { title: 'Загальний каталог маринадів', opposite: 'Перейти до рідких маринадів', next: 'liquid' },
};

const getPageSize = () => {
  if (window.innerWidth >= 1024) return 6;
  if (window.innerWidth >= 768) return 4;
  return Number.POSITIVE_INFINITY;
};

export const initializeCatalog = () => {
  const catalog = document.querySelector('[data-catalog-shell]');
  if (!catalog) return;

  const grid = catalog.querySelector('[data-catalog-grid]');
  const title = catalog.querySelector('[data-catalog-title]');
  const count = catalog.querySelector('[data-catalog-count]');
  const empty = catalog.querySelector('[data-catalog-empty]');
  const live = catalog.querySelector('[data-catalog-live]');
  const filterForm = catalog.querySelector('[data-catalog-filter]');
  const sidebar = catalog.querySelector('[data-catalog-sidebar]');
  const drawerOpen = catalog.querySelector('[data-catalog-drawer-open]');
  const drawerClosers = catalog.querySelectorAll('[data-catalog-drawer-close]');
  const opposite = catalog.querySelector('[data-catalog-opposite]');
  const home = catalog.querySelector('[data-catalog-home]');
  const previousPage = catalog.querySelector('[data-catalog-page-prev]');
  const nextPage = catalog.querySelector('[data-catalog-page-next]');
  const pageLabel = catalog.querySelector('[data-catalog-page-label]');
  const pagination = catalog.querySelector('[data-catalog-pagination]');
  const cartCount = catalog.querySelector('[data-cart-count]');
  const lightbox = initializeImageLightbox();

  let mode = 'liquid';
  let page = 0;
  let filteredProducts = [];
  let currentCardClose = null;
  let resizeFrame = 0;

  const announce = (message) => {
    live.textContent = '';
    window.requestAnimationFrame(() => { live.textContent = message; });
  };

  const updateCart = (summary = getCartSummary()) => {
    cartCount.textContent = String(summary.quantity);
  };

  const closeExpandedCard = async () => {
    if (!currentCardClose) return;
    const close = currentCardClose;
    currentCardClose = null;
    await close();
  };

  const requestExclusiveOpen = async (newClose) => {
    if (currentCardClose && currentCardClose !== newClose) await currentCardClose();
    currentCardClose = newClose;
  };

  const getVisibleProducts = () => {
    const pageSize = getPageSize();
    if (!Number.isFinite(pageSize)) return filteredProducts;
    return filteredProducts.slice(page * pageSize, (page + 1) * pageSize);
  };

  const render = () => {
    currentCardClose = null;
    grid.innerHTML = '';
    const pageSize = getPageSize();
    const pageCount = Number.isFinite(pageSize) ? Math.max(1, Math.ceil(filteredProducts.length / pageSize)) : 1;
    page = Math.min(page, pageCount - 1);

    getVisibleProducts().forEach((product) => {
      const card = createMarinadeCard(product);
      grid.append(card);
      initializeMarinadeCard(card, product, { lightbox, requestExclusiveOpen, announce });
    });

    empty.hidden = filteredProducts.length > 0;
    count.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'маринад' : 'маринадів'}`;
    pageLabel.textContent = `${page + 1} / ${pageCount}`;
    previousPage.disabled = page === 0;
    nextPage.disabled = page >= pageCount - 1;
    pagination.hidden = !Number.isFinite(pageSize) || pageCount <= 1;
  };

  const filterProducts = ({ types = [mode], colors = [], suitableFor = [] }) => {
    const normalizedTypes = types.includes('all') || !types.length ? ['liquid', 'dry'] : types;
    return marinades.filter((product) => (
      normalizedTypes.includes(product.type)
      && (!colors.length || colors.includes(product.color))
      && (!suitableFor.length || suitableFor.some((purpose) => product.suitableFor.includes(purpose)))
    ));
  };

  const syncModeControls = () => {
    title.innerHTML = modeMeta[mode].title;
    opposite.textContent = modeMeta[mode].opposite;
    opposite.dataset.nextMode = modeMeta[mode].next;
    const typeField = filterForm.querySelector(`[name="catalog-type"][value="${mode}"]`);
    if (typeField) typeField.checked = true;
    catalog.dataset.catalogMode = mode;
  };

  const setMode = (nextMode, { animate = false, updateBackground = false } = {}) => {
    mode = modeMeta[nextMode] ? nextMode : 'liquid';
    page = 0;
    syncModeControls();
    filteredProducts = filterProducts({ types: [mode] });
    const renderMode = () => render();
    if (animate && grid.children.length) animateCatalogFilter(grid, renderMode);
    else renderMode();
    if (updateBackground) requestCatalogBackground(catalog, mode);
  };

  const openCatalog = (nextMode) => {
    filterForm.querySelectorAll('input').forEach((field) => { field.checked = false; });
    setMode(nextMode);
    catalog.inert = false;
    catalog.setAttribute('aria-hidden', 'false');
    catalog.classList.add('catalog--active');
    gsap.fromTo(catalog.querySelector('.catalog__content'),
      { y: 22, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.48, ease: 'power3.out' },
    );
  };

  const hideCatalog = () => {
    closeExpandedCard();
    closeDrawer();
    catalog.classList.remove('catalog--active');
    catalog.setAttribute('aria-hidden', 'true');
    catalog.inert = true;
  };

  const openDrawer = () => {
    sidebar.classList.add('catalog-sidebar--open');
    catalog.classList.add('catalog--drawer-open');
    drawerOpen.setAttribute('aria-expanded', 'true');
  };

  const closeDrawer = () => {
    sidebar.classList.remove('catalog-sidebar--open');
    catalog.classList.remove('catalog--drawer-open');
    drawerOpen.setAttribute('aria-expanded', 'false');
  };

  initializeCatalogFilter(filterForm, {
    onApply: async (filters) => {
      await closeExpandedCard();
      const requestedMode = filters.types[0] || mode;
      mode = modeMeta[requestedMode] ? requestedMode : mode;
      page = 0;
      syncModeControls();
      filteredProducts = filterProducts(filters);
      animateCatalogFilter(grid, render);
      requestCatalogBackground(catalog, mode);
      closeDrawer();
    },
    onReset: async () => {
      await closeExpandedCard();
      setMode(mode, { animate: true });
      closeDrawer();
    },
  });

  filterForm.addEventListener('change', async (event) => {
    const field = event.target;
    if (field.name !== 'catalog-type' || !catalog.classList.contains('catalog--drawer-open')) return;
    await closeExpandedCard();
    setMode(field.value, { animate: true, updateBackground: true });
    closeDrawer();
  });

  previousPage.addEventListener('click', async () => {
    await closeExpandedCard();
    page = Math.max(0, page - 1);
    animateCatalogFilter(grid, render);
  });
  nextPage.addEventListener('click', async () => {
    await closeExpandedCard();
    page += 1;
    animateCatalogFilter(grid, render);
  });
  drawerOpen.addEventListener('click', openDrawer);
  drawerClosers.forEach((button) => button.addEventListener('click', closeDrawer));
  home.addEventListener('click', () => catalog.dispatchEvent(new CustomEvent('catalog:request-close', { bubbles: true })));
  opposite.addEventListener('click', async () => {
    await closeExpandedCard();
    setMode(opposite.dataset.nextMode, { animate: true, updateBackground: true });
    closeDrawer();
  });
  window.addEventListener('cart:updated', (event) => updateCart(event.detail));
  window.addEventListener('resize', () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      page = 0;
      render();
    });
  }, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !catalog.classList.contains('catalog--active') || document.body.classList.contains('page--lightbox-locked')) return;
    if (catalog.classList.contains('catalog--drawer-open')) closeDrawer();
    else if (currentCardClose) closeExpandedCard();
    else catalog.dispatchEvent(new CustomEvent('catalog:request-close', { bubbles: true }));
  });
  document.addEventListener('pointerdown', (event) => {
    if (catalog.classList.contains('catalog--drawer-open')
      && !event.target.closest('[data-catalog-sidebar]')
      && !event.target.closest('[data-catalog-drawer-open]')) {
      closeDrawer();
    }
    if (!currentCardClose || !catalog.classList.contains('catalog--active')) return;
    if (event.target.closest('.marinade-card') || event.target.closest('[data-image-lightbox]')) return;
    closeExpandedCard();
  });
  catalog.addEventListener('catalog:open', (event) => openCatalog(event.detail.mode));
  catalog.addEventListener('catalog:hide', hideCatalog);

  updateCart();
};
