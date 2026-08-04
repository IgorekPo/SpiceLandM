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

const getUnitWeight = (item) => Number.parseFloat(String(item.packageWeight).replace(',', '.')) || 0;

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

export const setCartItemQuantity = (productId, packageWeight, quantity) => {
  const item = items.find((cartItem) => (
    cartItem.productId === productId && cartItem.packageWeight === packageWeight
  ));
  if (!item) return getCartSummary();

  item.quantity = Math.max(1, Math.round(quantity));
  persist();
  return getCartSummary();
};

export const removeCartItem = (productId, packageWeight) => {
  items = items.filter((item) => !(
    item.productId === productId && item.packageWeight === packageWeight
  ));
  persist();
  return getCartSummary();
};

export const getCartSummary = () => ({
  items: items.map((item) => ({
    ...item,
    unitWeight: getUnitWeight(item),
    totalWeight: getUnitWeight(item) * item.quantity,
  })),
  quantity: items.reduce((total, item) => total + item.quantity, 0),
  subtotal: items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0),
  totalWeight: items.reduce((total, item) => total + (getUnitWeight(item) * item.quantity), 0),
});
