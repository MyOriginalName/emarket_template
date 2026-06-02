'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, LogOut, Star } from 'lucide-react';
import { useStore } from '@/lib/store';
import { auth as authApi, orders as ordersApi, wishlist as wishlistApi, reviews as reviewsApi } from '@/lib/api';
import toast from 'react-hot-toast';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser, logout: storeLogout } = useStore();
  const [tab, setTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [wishlistItems, setWishlistItems] = useState<Array<Record<string, unknown>>>([]);
  const [myReviews, setMyReviews] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'orders') {
        const { data } = await ordersApi.all();
        setOrders(data.data || []);
      } else if (tab === 'wishlist') {
        const { data } = await wishlistApi.all();
        setWishlistItems(data.data || data);
      } else if (tab === 'reviews') {
        const { data } = await reviewsApi.my();
        setMyReviews(data.data || data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* OK */ }
    storeLogout();
    router.push('/');
    toast.success('Выход выполнен');
  };

  const removeWishlist = async (productId: number) => {
    try {
      await wishlistApi.remove(productId);
      setWishlistItems(w => w.filter(i => i.product_id !== productId));
      toast.success('Удалено из избранного');
    } catch {
      toast.error('Ошибка');
    }
  };

  const tabs = [
    { key: 'profile', label: 'Профиль', icon: User },
    { key: 'orders', label: 'Заказы', icon: Package },
    { key: 'wishlist', label: 'Избранное', icon: Heart },
    { key: 'reviews', label: 'Отзывы', icon: Star },
  ];

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Личный кабинет</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border overflow-hidden">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left border-b last:border-b-0 hover:bg-gray-50 transition-colors ${tab === t.key ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}>
                <t.icon className="h-5 w-5" />
                {t.label}
              </button>
            ))}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="h-5 w-5" />
              Выйти
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl p-6 border">
            {tab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Профиль</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">Имя</label>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Email</label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Телефон</label>
                    <p className="font-medium">{user.phone || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Роль</label>
                    <p className="font-medium">{user.is_admin ? 'Администратор' : 'Покупатель'}</p>
                  </div>
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Мои заказы</h2>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-lg" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500">У вас пока нет заказов</p>
                ) : (
                  <div className="space-y-4">
                    {(orders as Array<Record<string, unknown>>).map((order: Record<string, unknown>) => (
                      <Link key={order.id as number} href={`/orders/${order.id}`}
                        className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">#{order.order_number as string}</span>
                            <span className="text-sm text-gray-500 ml-3">
                              {new Date(order.created_at as string).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.status === 'new' ? 'Новый' :
                               order.status === 'confirmed' ? 'Подтвержден' :
                               order.status === 'processing' ? 'В обработке' :
                               order.status === 'shipped' ? 'Отправлен' :
                               order.status === 'delivered' ? 'Доставлен' : 'Отменен'}
                            </span>
                            <span className="font-bold text-indigo-600">{(order.total as number).toLocaleString()} ₽</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Избранное</h2>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-lg" />)}
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <p className="text-gray-500">Список избранного пуст</p>
                ) : (
                  <div className="space-y-4">
                    {(wishlistItems as Array<Record<string, unknown>>).map((item: Record<string, unknown>) => {
                      const p = item.product as Record<string, unknown> | undefined;
                      return (
                        <div key={item.id as number} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                          <Link href={`/product/${p?.slug}`} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                              {p?.image ? (
                                <img src={p.image as string} alt={p.name as string} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Heart className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{p?.name as string}</p>
                              <p className="text-indigo-600 font-bold">{(p?.price as number)?.toLocaleString()} ₽</p>
                            </div>
                          </Link>
                          <button onClick={() => removeWishlist(item.product_id as number)}
                            className="text-red-400 hover:text-red-600">
                            <Heart className="h-5 w-5 fill-red-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Мои отзывы</h2>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-lg" />)}
                  </div>
                ) : myReviews.length === 0 ? (
                  <p className="text-gray-500">Вы еще не оставляли отзывы</p>
                ) : (
                  <div className="space-y-4">
                    {(myReviews as Array<Record<string, unknown>>).map((review: Record<string, unknown>) => {
                      const p = review.product as Record<string, unknown> | undefined;
                      return (
                        <div key={review.id as number} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Link href={`/product/${p?.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">
                              {p?.name as string}
                            </Link>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating as number }, (_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          {(review.text as string) && <p className="text-sm text-gray-600">{review.text as string}</p>}
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(review.created_at as string).toLocaleDateString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>}>
      <AccountContent />
    </Suspense>
  );
}
