import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addToCart     as apiAddToCart,
  mergeCart     as apiMergeCart,
  removeFromCart as apiRemoveFromCart,
  updateQuantity as apiUpdateQuantity,
} from '../services/productService';
const STORAGE_KEY = 'bakery_guest_cart';
const loadGuestCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(parsed)) return parsed;
    if (parsed?.items && Array.isArray(parsed.items)) return parsed.items;
    return [];
  }
  catch { return []; }
};
const saveGuestCart  = (cart) => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
const clearGuestCart = ()     => localStorage.removeItem(STORAGE_KEY);
const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [items,     setItems]     = useState(loadGuestCart);
  const [cartError, setCartError] = useState(null);
  const prevLoggedIn              = useRef(isLoggedIn);
  const setFromServer = useCallback((data) => {
    const serverItems = Array.isArray(data?.items) ? data.items : [];
    setItems(serverItems);
  }, []);
  useEffect(() => {
    prevLoggedIn.current = isLoggedIn;
    if (isLoggedIn) {
      const guestItems = loadGuestCart();
      mergeAndLoad(guestItems);
    } else {
      setItems(loadGuestCart());
    }
  }, [isLoggedIn]);
  const mergeAndLoad = async (guestItems) => {
    try {
      if (guestItems.length > 0) {
        const serverCart = await apiMergeCart(guestItems.map(i => ({ productId: i.productId, quantity: i.quantity })));
        clearGuestCart();
        setFromServer(serverCart);
      } else {
        const serverCart = await getCart();
        setFromServer(serverCart);
      }
    } catch {
      setCartError('שגיאה בסנכרון העגלה');
    }
  };
  useEffect(() => {
    if (!isLoggedIn) saveGuestCart(items);
  }, [items, isLoggedIn]);
  const cartCount = (items ?? []).reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = (items ?? []).reduce((sum, i) => sum + (i.subtotal ?? i.price * i.quantity), 0);
  const addItem = useCallback(async (product, quantity = 1) => {
    if (!isLoggedIn) {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product._id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, {
          _id: `guest_${Date.now()}`,
          productId: product._id,
          name:      product.name,
          price:     product.price,
          imageUrl:  product.imageUrl,
          quantity,
        }];
      });
      return;
    }
    const previous = items;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity }];
    });
    try {
      const serverCart = await apiAddToCart(product._id, quantity);
      setFromServer(serverCart);
    } catch (err) {
      setItems(previous);
      setCartError(err.message || 'שגיאה בהוספה לעגלה');
    }
  }, [items, isLoggedIn, setFromServer]);
  const removeItem = useCallback(async (cartItemId) => {
    if (!isLoggedIn) {
      setItems((prev) => prev.filter((i) => i._id !== cartItemId));
      return;
    }
    const previous = items;
    setItems((prev) => prev.filter((i) => i._id !== cartItemId));
    try {
      const serverCart = await apiRemoveFromCart(cartItemId);
      setFromServer(serverCart);
    } catch {
      setItems(previous);
      setCartError('שגיאה בהסרת פריט');
    }
  }, [items, isLoggedIn, setFromServer]);
  const changeQuantity = useCallback(async (cartItemId, quantity) => {
    if (quantity < 1) return removeItem(cartItemId);
    if (!isLoggedIn) {
      setItems((prev) => prev.map((i) => (i._id === cartItemId ? { ...i, quantity } : i)));
      return;
    }
    const previous = items;
    setItems((prev) => prev.map((i) => (i._id === cartItemId ? { ...i, quantity } : i)));
    try {
      const serverCart = await apiUpdateQuantity(cartItemId, quantity);
      setFromServer(serverCart);
    } catch {
      setItems(previous);
      setCartError('שגיאה בעדכון כמות');
    }
  }, [items, removeItem, isLoggedIn, setFromServer]);
  const clearCart = useCallback(() => {
    setItems([]);
    if (!isLoggedIn) clearGuestCart();
  }, [isLoggedIn]);
  return (
    <CartContext.Provider value={{
      cart: items, cartCount, cartTotal, cartError,
      addItem, removeItem, changeQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);