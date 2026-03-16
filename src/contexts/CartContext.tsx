import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { cartService } from "../services/CartService/cartService";
import { CartItem } from "../types/cart";

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string, quantityToRemove?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setCartItems([]);
      setCartCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let items = await cartService.getCart();
      if (items === null) items = [];

      setCartItems(items);
      setCartCount(items.reduce((sum, i) => sum + i.quantity, 0));
    } catch (err) {
      console.error("Refresh cart error:", err);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setCartItems([]);
        setCartCount(0);
        setLoading(false);
        return;
      }

      refreshCart();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  const addToCart = async (productId: string, quantity: number = 1) => {
    const success = await cartService.addToCart(productId, quantity);
    if (success) await refreshCart();
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(cartItemId);
      return;
    }

    let success = await cartService.updateCartItem(cartItemId, quantity);
    
    // Retry 1 lần nếu concurrency error (thường là 400)
    if (!success) {
      await new Promise(r => setTimeout(r, 400));
      success = await cartService.updateCartItem(cartItemId, quantity);
    }

    if (success) {
      await refreshCart();
    } else {
      await refreshCart(); // Đồng bộ lại từ server
    }
  };

  const removeItem = async (cartItemId: string, quantityToRemove: number = 1) => {
    let success = await cartService.removeCartItem(cartItemId, quantityToRemove);
    
    if (!success) {
      await new Promise(r => setTimeout(r, 400));
      success = await cartService.removeCartItem(cartItemId, quantityToRemove);
    }

    if (success) {
      await refreshCart();
    } else {
      await refreshCart();
    }
  };

  const clearCart = async () => {
    const success = await cartService.clearCart();
    if (success) await refreshCart();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart phải được dùng trong CartProvider");
  return context;
};