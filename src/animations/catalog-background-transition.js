export const requestCatalogBackground = (catalog, mode) => {
  if (!['liquid', 'dry'].includes(mode)) return;
  catalog.dispatchEvent(new CustomEvent('catalog:background-change', {
    bubbles: true,
    detail: { category: mode },
  }));
};
