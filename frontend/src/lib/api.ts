import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

if (typeof window !== 'undefined' && !localStorage.getItem('session_id')) {
  localStorage.setItem('session_id', 'sess_' + Math.random().toString(36).substring(2, 15));
}

export const auth = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  user: () => api.get('/auth/user'),
  updateProfile: (data: Record<string, unknown>) => api.put('/auth/profile', data),
};

export const categories = {
  all: () => api.get('/categories'),
  tree: () => api.get('/categories/tree'),
  bySlug: (slug: string) => api.get(`/categories/${slug}`),
};

export const products = {
  all: (params?: Record<string, unknown>) => api.get('/products', { params }),
  featured: () => api.get('/products/featured'),
  bySlug: (slug: string) => api.get(`/products/${slug}`),
};

export const cart = {
  show: () => api.get('/cart'),
  add: (data: { product_id: number; variant_id?: number | null; quantity: number }) =>
    api.post('/cart/add', data),
  update: (data: { item_id: number; quantity: number }) => api.post('/cart/update', data),
  remove: (data: { item_id: number }) => api.post('/cart/remove', data),
  clear: () => api.delete('/cart'),
  applyCoupon: (code: string) => api.post('/cart/apply-coupon', { code }),
  removeCoupon: () => api.post('/cart/remove-coupon'),
};

export const checkout = {
  store: (data: Record<string, unknown>) => api.post('/checkout', data),
};

export const orders = {
  all: () => api.get('/orders'),
  byId: (id: number) => api.get(`/orders/${id}`),
};

export const reviews = {
  create: (data: { product_id: number; rating: number; text?: string }) =>
    api.post('/reviews', data),
  my: () => api.get('/reviews/my'),
};

export const wishlist = {
  all: () => api.get('/wishlist'),
  toggle: (product_id: number) => api.post('/wishlist', { product_id }),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`),
};

export const admin = {
  dashboard: () => api.get('/admin/dashboard'),
  products: {
    all: (params?: Record<string, unknown>) => api.get('/admin/products', { params }),
    byId: (id: number) => api.get(`/admin/products/${id}`),
    create: (data: Record<string, unknown>) => api.post('/admin/products', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/admin/products/${id}`, data),
    delete: (id: number) => api.delete(`/admin/products/${id}`),
    uploadImage: (id: number, file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return api.post(`/admin/products/${id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    deleteImage: (productId: number, mediaId: number) =>
      api.delete(`/admin/products/${productId}/media/${mediaId}`),
  },
  categories: {
    all: () => api.get('/admin/categories'),
    create: (data: Record<string, unknown>) => api.post('/admin/categories', data),
    byId: (id: number) => api.get(`/admin/categories/${id}`),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/admin/categories/${id}`, data),
    delete: (id: number) => api.delete(`/admin/categories/${id}`),
  },
  orders: {
    all: (params?: Record<string, unknown>) => api.get('/admin/orders', { params }),
    byId: (id: number) => api.get(`/admin/orders/${id}`),
    updateStatus: (id: number, status: string) =>
      api.patch(`/admin/orders/${id}/status`, { status }),
  },
  coupons: {
    all: () => api.get('/admin/coupons'),
    create: (data: Record<string, unknown>) => api.post('/admin/coupons', data),
    byId: (id: number) => api.get(`/admin/coupons/${id}`),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/admin/coupons/${id}`, data),
    delete: (id: number) => api.delete(`/admin/coupons/${id}`),
  },
  users: {
    all: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
    byId: (id: number) => api.get(`/admin/users/${id}`),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/admin/users/${id}`, data),
    delete: (id: number) => api.delete(`/admin/users/${id}`),
  },
};

export default api;
