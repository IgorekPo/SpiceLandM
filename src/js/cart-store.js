const STORAGE_KEY = 'spiceland-cart';

const readCart = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

let items = readCart();

const persist = () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: getCartSummary() }));
};

export const addMarinadeToCart = (product) => {
  const existing = items.find((item) => (
    item.productId === product.id && item.packageWeight === product.packageWeight
  ));

  if (existing) existing.quantity += 1;
  else {
    items.push({
      productId: product.id,
      name: product.name,
      type: product.type,
      packageWeight: product.packageWeight,
      unitPrice: product.price,
      quantity: 1,
      thumbnail: product.thumbnail,
    });
  }

  persist();
  return getCartSummary();
};

export const getCartSummary = () => ({
  items: [...items],
  quantity: items.reduce((total, item) => total + item.quantity, 0),
  subtotal: items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0),
});
