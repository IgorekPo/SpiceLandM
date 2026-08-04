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

const getCatalogLayout = () => {
  if (window.innerWidth >= 1024) return { name: 'desktop', pageSize: 6 };
  if (window.innerWidth >= 768) return { name: 'tablet', pageSize: 4 };
  return { name: 'mobile', pageSize: Number.POSITIVE_INFINITY };
};

export const initializeCatalog = () => {
  const catalog = document.querySelector('[data-catalog-shell]');
  if (!catalog) return;

  const grid = catalog.querySelector('[data-catalog-grid]');
  const content = catalog.querySelector('.catalog__content');
  const title = catalog.querySelector('[data-catalog-title]');
  const count = catalog.querySelector('[data-catalog-count]');
  const empty = catalog.querySelector('[data-catalog-empty]');
  const live = catalog.querySelector('[data-catalog-live]');
  const filterForm = catalog.querySelector('[data-catalog-filter]');
  const sidebar = catalog.querySelector('[data-catalog-sidebar]');
  const drawerOpen = catalog.querySelector('[data-catalog-drawer-open]');
  const drawerClosers = catalog.querySelectorAll('[data-catalog-drawer-close]');
  const home = catalog.querySelector('[data-catalog-home]');
  const opposite = catalog.querySelector('[data-catalog-opposite]');
  const previousPage = catalog.querySelector('[data-catalog-page-prev]');
  const nextPage = catalog.querySelector('[data-catalog-page-next]');
  const pageLabel = catalog.querySelector('[data-catalog-page-label]');
  const pagination = catalog.querySelector('[data-catalog-pagination]');
  const cartCount = catalog.querySelector('[data-cart-count]');
  const lightbox = initializeImageLightbox();

  let mode = 'liquid';
  let page = 0;
  let layout = getCatalogLayout();
  let filteredProducts = [];
  let currentCardClose = null;
  let resizeFrame = 0;
  let pageAnimating = false;
  let pointerGesture = null;
  let mobileSwipeGesture = null;

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

  const getPageCount = () => (
    Number.isFinite(layout.pageSize)
      ? Math.max(1, Math.ceil(filteredProducts.length / layout.pageSize))
      : 1
  );

  const getVisibleProducts = () => {
    if (!Number.isFinite(layout.pageSize)) return filteredProducts;
    return filteredProducts.slice(page * layout.pageSize, (page + 1) * layout.pageSize);
  };

  const render = () => {
    currentCardClose = null;
    grid.innerHTML = '';
    const pageCount = getPageCount();
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
    pagination.hidden = layout.name === 'mobile' || pageCount <= 1;
    if (layout.name === 'mobile') grid.scrollLeft = 0;
  };

  const changePage = async (nextPageIndex) => {
    if (pageAnimating || layout.name === 'mobile') return;
    const targetPage = Math.max(0, Math.min(nextPageIndex, getPageCount() - 1));
    if (targetPage === page) return;

    pageAnimating = true;
    await closeExpandedCard();
    page = targetPage;
    await animateCatalogFilter(grid, render);
    announce(`Група маринадів ${page + 1} з ${getPageCount()}.`);
    pageAnimating = false;
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
    document.body.classList.add('page--catalog-open');
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
    document.body.classList.remove('page--catalog-open');
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

  drawerOpen.addEventListener('click', openDrawer);
  drawerClosers.forEach((button) => button.addEventListener('click', closeDrawer));
  previousPage.addEventListener('click', () => changePage(page - 1));
  nextPage.addEventListener('click', () => changePage(page + 1));
  home.addEventListener('click', () => {
    closeDrawer();
    catalog.dispatchEvent(new CustomEvent('catalog:request-close', { bubbles: true }));
    window.setTimeout(() => document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 900);
  });
  opposite.addEventListener('click', async () => {
    await closeExpandedCard();
    setMode(opposite.dataset.nextMode, { animate: true, updateBackground: true });
    closeDrawer();
  });
  grid.addEventListener('keydown', (event) => {
    if (event.target !== grid || layout.name === 'mobile') return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changePage(page - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      changePage(page + 1);
    }
  });
  grid.addEventListener('pointerdown', (event) => {
    if (layout.name === 'mobile' || pageAnimating || event.button !== 0) return;
    if (event.target.closest('button, a, input, .marinade-card--expanded')) return;
    pointerGesture = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    grid.classList.add('catalog__grid--dragging');
    grid.setPointerCapture?.(event.pointerId);
    if (event.pointerType === 'mouse') event.preventDefault();
  });
  const finishPointerGesture = (event) => {
    if (!pointerGesture || pointerGesture.id !== event.pointerId) return;
    const distanceX = event.clientX - pointerGesture.startX;
    const distanceY = event.clientY - pointerGesture.startY;
    pointerGesture = null;
    grid.classList.remove('catalog__grid--dragging');
    if (grid.hasPointerCapture?.(event.pointerId)) grid.releasePointerCapture(event.pointerId);
    if (Math.abs(distanceX) < 48 || Math.abs(distanceX) <= Math.abs(distanceY) * 1.15) return;
    changePage(page + (distanceX < 0 ? 1 : -1));
  };
  grid.addEventListener('pointerup', finishPointerGesture);
  grid.addEventListener('pointercancel', (event) => {
    if (!pointerGesture || pointerGesture.id !== event.pointerId) return;
    pointerGesture = null;
    grid.classList.remove('catalog__grid--dragging');
  });
  content.addEventListener('pointerdown', (event) => {
    if (layout.name !== 'mobile' || event.button !== 0) return;
    if (event.target.closest('button, a, input, label, select, textarea, [data-catalog-sidebar]')) return;
    mobileSwipeGesture = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: grid.scrollLeft,
      horizontal: false,
    };
    content.setPointerCapture?.(event.pointerId);
  });
  content.addEventListener('pointermove', (event) => {
    if (!mobileSwipeGesture || mobileSwipeGesture.id !== event.pointerId || layout.name !== 'mobile') return;
    const distanceX = event.clientX - mobileSwipeGesture.startX;
    const distanceY = event.clientY - mobileSwipeGesture.startY;

    if (!mobileSwipeGesture.horizontal) {
      if (Math.abs(distanceX) < 8) return;
      if (Math.abs(distanceX) <= Math.abs(distanceY) * 1.1) return;
      mobileSwipeGesture.horizontal = true;
      content.classList.add('catalog__content--swiping');
    }

    event.preventDefault();
    grid.scrollLeft = mobileSwipeGesture.startScrollLeft - distanceX;
  }, { passive: false });
  const finishMobileSwipe = (event) => {
    if (!mobileSwipeGesture || mobileSwipeGesture.id !== event.pointerId) return;
    const wasHorizontal = mobileSwipeGesture.horizontal;
    mobileSwipeGesture = null;
    content.classList.remove('catalog__content--swiping');
    if (content.hasPointerCapture?.(event.pointerId)) content.releasePointerCapture(event.pointerId);
    if (!wasHorizontal) return;

    const cards = [...grid.querySelectorAll('.marinade-card')];
    const nearestTarget = cards.reduce((closest, card) => {
      const target = card.offsetLeft - ((grid.clientWidth - card.offsetWidth) / 2);
      const distance = Math.abs(target - grid.scrollLeft);
      return !closest || distance < closest.distance ? { target, distance } : closest;
    }, null)?.target;
    if (Number.isFinite(nearestTarget)) grid.scrollTo({ left: nearestTarget, behavior: 'smooth' });
  };
  content.addEventListener('pointerup', finishMobileSwipe);
  content.addEventListener('pointercancel', finishMobileSwipe);
  window.addEventListener('cart:updated', (event) => updateCart(event.detail));
  window.addEventListener('resize', () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(async () => {
      resizeFrame = 0;
      const nextLayout = getCatalogLayout();
      if (nextLayout.name === layout.name) return;
      await closeExpandedCard();
      layout = nextLayout;
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
