'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkout as checkoutApi, cart as cartApi } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, setCart, user } = useStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    delivery_method: 'courier',
    payment_method: 'card',
    address: '',
    city: '',
    region: '',
    zip: '',
    note: '',
  });

  useEffect(() => {
    if (!cart) {
      cartApi.show().then(({ data }) => {
        setCart(data);
        if (!data.items || data.items.length === 0) {
          router.push('/cart');
        }
      }).catch(() => router.push('/cart'));
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await checkoutApi.store(form);
      setCart(null);
      const orderNum = data.order?.order_number || '';
      toast.success(`Заказ #${orderNum} оформлен!`);
      if (user) {
        router.push(`/orders/${data.order.id}`);
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Ошибка оформления заказа');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !cart || !cart.items?.length) {
    return <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Оформление заказа</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Контактные данные</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
                <input required value={form.customer_name}
                  onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" value={form.customer_email}
                  onChange={(e) => setForm(f => ({ ...f, customer_email: e.target.value }))}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                <input required type="tel" value={form.customer_phone}
                  onChange={(e) => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                  className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Доставка</h2>
            <div className="space-y-3 mb-4">
              {[
                { value: 'courier', label: 'Курьером', desc: 'Доставка по адресу (500 ₽)' },
                { value: 'pickup', label: 'Самовывоз', desc: 'Бесплатно' },
                { value: 'post', label: 'Почта России', desc: 'По тарифам почты' },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-center p-3 border rounded-lg cursor-pointer ${form.delivery_method === opt.value ? 'border-indigo-600 bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="delivery" value={opt.value}
                    checked={form.delivery_method === opt.value}
                    onChange={(e) => setForm(f => ({ ...f, delivery_method: e.target.value }))}
                    className="mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">{opt.label}</span>
                    <p className="text-sm text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {form.delivery_method !== 'pickup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Адрес *</label>
                  <input required value={form.address}
                    onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Город *</label>
                  <input required value={form.city}
                    onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-4 py-2.5 border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Регион</label>
                    <input value={form.region}
                      onChange={(e) => setForm(f => ({ ...f, region: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Индекс</label>
                    <input value={form.zip}
                      onChange={(e) => setForm(f => ({ ...f, zip: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-lg" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Оплата</h2>
            <div className="space-y-3">
              {[
                { value: 'card', label: 'Картой онлайн', desc: 'Visa, Mastercard, МИР' },
                { value: 'cash', label: 'Наличными при получении', desc: 'Оплата при получении заказа' },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-center p-3 border rounded-lg cursor-pointer ${form.payment_method === opt.value ? 'border-indigo-600 bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value={opt.value}
                    checked={form.payment_method === opt.value}
                    onChange={(e) => setForm(f => ({ ...f, payment_method: e.target.value }))}
                    className="mr-3" />
                  <div>
                    <span className="font-medium text-gray-900">{opt.label}</span>
                    <p className="text-sm text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий к заказу</label>
            <textarea value={form.note} rows={3}
              onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-lg" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 border sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Ваш заказ</h3>
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-gray-400 text-xs">{item.quantity} × {item.price.toLocaleString()} ₽</p>
                  </div>
                  <span className="font-medium">{item.total.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Подытог</span>
                <span>{cart.subtotal.toLocaleString()} ₽</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Скидка</span>
                  <span>-{cart.discount.toLocaleString()} ₽</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Доставка</span>
                <span>{form.delivery_method === 'courier' ? '500 ₽' : 'Бесплатно'}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Итого</span>
                <span className="text-indigo-600">
                  {(cart.total + (form.delivery_method === 'courier' ? 500 : 0)).toLocaleString()} ₽
                </span>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
              {submitting ? 'Оформляем...' : 'Подтвердить заказ'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
