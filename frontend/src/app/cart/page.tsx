'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { cart as cartApi } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, setCart } = useStore();
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const { data } = await cartApi.show();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const { data } = await cartApi.update({ item_id: itemId, quantity });
      setCart(data);
    } catch {
      toast.error('Ошибка обновления');
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const { data } = await cartApi.remove({ item_id: itemId });
      setCart(data);
      toast.success('Товар удален');
    } catch {
      toast.error('Ошибка');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await cartApi.applyCoupon(couponCode);
      toast.success(data.message || 'Купон применен');
      loadCart();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Неверный купон');
    }
  };

  const removeCoupon = async () => {
    try {
      await cartApi.removeCoupon();
      loadCart();
      toast.success('Купон удален');
    } catch {
      toast.error('Ошибка');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Корзина пуста</h2>
        <p className="text-gray-400 mb-8">Добавьте товары в корзину, чтобы оформить заказ</p>
        <Link href="/catalog" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Корзина</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 border flex items-center gap-4">
              <Link href={`/product/${item.product.slug}`} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.product.slug}`} className="font-medium text-gray-900 hover:text-indigo-600 line-clamp-1">
                  {item.product.name}
                </Link>
                {item.variant_name && <p className="text-sm text-gray-500">{item.variant_name}</p>}
                <p className="text-lg font-bold text-indigo-600 mt-1">{item.price.toLocaleString()} ₽</p>
              </div>
              <div className="flex items-center border rounded-lg">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-2 hover:bg-gray-50"><Minus className="h-4 w-4" /></button>
                <span className="px-4 font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 hover:bg-gray-50"><Plus className="h-4 w-4" /></button>
              </div>
              <p className="text-lg font-bold text-gray-900 w-24 text-right">{item.total.toLocaleString()} ₽</p>
              <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 border h-fit sticky top-24">
          <h3 className="font-semibold text-gray-900 mb-4">Сумма заказа</h3>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Товары ({cart.items_count} шт.)</span>
              <span className="font-medium">{cart.subtotal.toLocaleString()} ₽</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-green-600">Скидка</span>
                <span className="font-medium text-green-600">-{cart.discount.toLocaleString()} ₽</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">Итого</span>
              <span className="font-bold text-indigo-600">{cart.total.toLocaleString()} ₽</span>
            </div>
          </div>

          {cart.coupon ? (
            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg mb-4">
              <span className="text-sm text-green-700">Купон: {cart.coupon.code}</span>
              <button onClick={removeCoupon} className="text-red-500 text-sm hover:underline">Удалить</button>
            </div>
          ) : (
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Промокод" value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="min-w-0 flex-1 px-3 py-2 border rounded-lg text-sm" />
              <button onClick={applyCoupon}
                className="shrink-0 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Применить
              </button>
            </div>
          )}

          <Link href="/checkout"
            className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            Оформить заказ
          </Link>
        </div>
      </div>
    </div>
  );
}
