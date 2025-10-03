// utils/cart.js

// ====== Configs ======
export const VAT_RATE = 0.07; // 7% (change as needed)

// ====== Internal helpers ======
function notifyCartChanged() {
  // Defer to avoid setState during another component's render phase
  setTimeout(() => {
    try {
      window.dispatchEvent(new CustomEvent("cart:change"));
      // Do NOT dispatch synthetic 'storage' — browser fires it only across tabs.
    } catch {}
  }, 0);
}

// ====== Minimal localStorage CRUD ({ id, quantity }) ======
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
  const idx = cart.findIndex((i) => i.id === productId);
  const q = Math.max(1, Number(quantity || 1));
  if (idx > -1) {
    cart[idx].quantity = Math.max(1, Number(cart[idx].quantity || 1) + q);
  } else {
    cart.push({ id: productId, quantity: q });
  }
  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const next = getCart().filter((i) => i.id !== productId);
  saveCart(next);
  return next;
};

export const updateQuantity = (productId, quantity) => {
  const q = Math.max(1, Number(quantity || 1));
  const next = getCart()
    .map((i) => (i.id === productId ? { ...i, quantity: q } : i))
    .filter((i) => Number(i.quantity) > 0);
  saveCart(next);
  return next;
};

export const clearCart = () => {
  saveCart([]);
  return [];
};

// ====== Pricing helpers ======
export function computeTotals(detailedItems, vatRate = VAT_RATE) {
  const subtotal = detailedItems.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
    0
  );
  const vat = subtotal * vatRate;
  const total = subtotal + vat;
  return { subtotal, vat, total };
}

export function formatTHB(value) {
  const n = Number(value || 0);
  return `THB ${new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;
}

// ====== Data hydration (fetch latest prices/details) ======
// Returns: [{ id, quantity, name, price, image }]
export async function getCartDetailed() {
  const base = getCart();
  if (!base.length) return [];

  const detailed = await Promise.all(
    base.map(async (row) => {
      try {
        const res = await fetch(`/api/products/${row.id}`, { cache: "no-store" });
        const json = await res.json();
        const p = json?.data || json;
        return {
          id: row.id,
          quantity: Number(row.quantity || 1),
          name: p?.name || "Unnamed product",
          price: Number(p?.price || 0), // always use latest backend price
          image: p?.image_path || "",
        };
      } catch {
        // Fallback if API fails
        return {
          id: row.id,
          quantity: Number(row.quantity || 1),
          name: "Unknown",
          price: 0,
          image: "",
        };
      }
    })
  );

  return detailed;
}

// ====== Optional UX helper ======
// Add with a quick snapshot (still re-priced later via getCartDetailed)
export const addToCartWithSnapshot = (product, quantity = 1) => {
  // product: { id, name?, price?, image? } — we still store minimal fields to avoid stale price
  const cart = getCart();
  const idx = cart.findIndex((i) => i.id === product.id);
  const q = Math.max(1, Number(quantity || 1));
  if (idx > -1) {
    cart[idx].quantity = Math.max(1, Number(cart[idx].quantity || 1) + q);
  } else {
    cart.push({ id: product.id, quantity: q });
  }
  saveCart(cart);
  return cart;
};
