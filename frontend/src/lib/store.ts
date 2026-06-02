import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
}

interface CartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  product: { id: number; name: string; slug: string; image: string };
  variant_name: string | null;
  quantity: number;
  price: number;
  total: number;
}

interface Cart {
  id: number;
  items: CartItem[];
  coupon: { code: string; discount: number } | null;
  subtotal: number;
  discount: number;
  total: number;
  items_count: number;
}

interface AppStore {
  user: User | null;
  token: string | null;
  cart: Cart | null;
  cartLoading: boolean;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setCart: (cart: Cart | null) => void;
  setCartLoading: (loading: boolean) => void;
  hydrate: () => void;
  logout: () => void;
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  token: null,
  cart: null,
  cartLoading: false,
  hydrated: false,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    set({ token });
  },
  setCart: (cart) => set({ cart }),
  setCartLoading: (loading) => set({ cartLoading: loading }),
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');
      set({ user, token, hydrated: true });
    }
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null });
  },
}));
