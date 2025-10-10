// utils/cart.js

/* ============================================================
   Configurations
   ============================================================ */
export const VAT_RATE = 0.07; // 7%

/* ============================================================
   Internal Helpers
   ============================================================ */
function notifyCartChanged() {
  // Defer dispatch to avoid triggering setState during render
  setTimeout(() => {
    try {
      window.dispatchEvent(new CustomEvent("cart:change"));
    } catch {}
  }, 0);
}

/* ============================================================
   Minimal localStorage CRUD ({ id, quantity })
   ============================================================ */
export const getCart = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
};

export const saveCart = (cart) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cart", JSON.stringify(cart));
  notifyCartChanged();
};

export const addToCart = (productId, quantity = 1) => {
  const cart = getCart();
  const index = cart.findIndex((item) => item.id === productId);
  const q = Math.max(1, Number(quantity || 1));

  if (index > -1) {
    cart[index].quantity = Math.max(1, Number(cart[index].quantity || 1) + q);
  } else {
    cart.push({ id: productId, quantity: q });
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const next = getCart().filter((item) => item.id !== productId);
  saveCart(next);
  return next;
};

export const updateQuantity = (productId, quantity) => {
  const q = Math.max(1, Number(quantity || 1));
  const next = getCart()
    .map((item) => (item.id === productId ? { ...item, quantity: q } : item))
    .filter((item) => Number(item.quantity) > 0);

  saveCart(next);
  return next;
};

export const clearCart = () => {
  saveCart([]);
  return [];
};

/* ============================================================
   Pricing Helpers
   ============================================================ */
export function computeTotals(detailedItems, vatRate = VAT_RATE) {
  // If hide_price is true (or 1), treat its price as 0
  const subtotal = detailedItems.reduce((sum, item) => {
    const price = item.hide_price ? 0 : Number(item.price || 0);
    return sum + price * Number(item.quantity || 0);
  }, 0);

  const vat = subtotal * vatRate;
  const total = subtotal + vat;
  return { subtotal, vat, total };
}

export function formatTHB(value) {
  const numberValue = Number(value || 0);
  return `THB ${new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue)}`;
}

/* ============================================================
   Data Hydration (Fetch Latest Prices/Details)
   ============================================================ */
// Returns: [{ id, quantity, name, price, image, hide_price }]
export async function getCartDetailed() {
  const base = getCart();
  if (!base.length) return [];

  const detailed = await Promise.all(
    base.map(async (row) => {
      try {
        const res = await fetch(`/api/products/${row.id}`, { cache: "no-store" });
        const json = await res.json();
        const product = json?.data || json;

        return {
          id: row.id,
          quantity: Number(row.quantity || 1),
          name: product?.name || "Unnamed product",
          price: Number(product?.price || 0),
          image: product?.image_path || "",
          hide_price: !!product?.hide_price, // normalize to boolean
        };
      } catch {
        // Fallback if product fetch fails
        return {
          id: row.id,
          quantity: Number(row.quantity || 1),
          name: "Unknown",
          price: 0,
          image: "",
          hide_price: false,
        };
      }
    })
  );

  return detailed;
}

/* ============================================================
   UX Helper
   ============================================================ */
// Add with a quick snapshot (still re-priced later via getCartDetailed)
export const addToCartWithSnapshot = (product, quantity = 1) => {
  // product: { id, name?, price?, image? }
  const cart = getCart();
  const index = cart.findIndex((item) => item.id === product.id);
  const q = Math.max(1, Number(quantity || 1));

  if (index > -1) {
    cart[index].quantity = Math.max(1, Number(cart[index].quantity || 1) + q);
  } else {
    cart.push({ id: product.id, quantity: q });
  }

  saveCart(cart);
  return cart;
};
