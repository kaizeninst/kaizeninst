// get cart from localStorage
export const getCart = () => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }
  return [];
};

//save cart to localStorage
export const saveCart = (cart) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
};

// Add product to cart
export const addToCart = (productId, quantity = 1) => {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity });
  }

  saveCart(cart);
};

// Remove product from cart
export const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  return cart;
};

// Update quantity for a product
export const updateQuantity = (productId, quantity) => {
  const cart = getCart()
    .map((item) => (item.id === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  saveCart(cart);
  return cart;
};
