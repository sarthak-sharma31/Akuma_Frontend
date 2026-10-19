import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

const CART_KEY = "akumafits_cart";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Load from localStorage on first render
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = (product, size) => {
    const itemId = product._id || product.id;
    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === itemId && i.size === size);
      if (existing)
        return prev.map((i) =>
          i.itemId === itemId && i.size === size ? { ...i, qty: i.qty + 1 } : i
        );
      return [...prev, { ...product, itemId, size, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (itemId, size) =>
    setCart((prev) => prev.filter((i) => !(i.itemId === itemId && i.size === size)));

  const updateQty = (itemId, size, delta) =>
    setCart((prev) =>
      prev.map((i) =>
        i.itemId === itemId && i.size === size ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
    );

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, cartOpen, setCartOpen, totalItems, totalPrice, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}