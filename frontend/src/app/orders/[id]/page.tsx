'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { orders as ordersApi } from '@/lib/api';
import { useStore } from '@/lib/store';

interface Order {
  id: number;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: string;
  delivery_method: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_data: Record<string, string>;
  note: string | null;
  created_at: string;
  items: Array<{
    id: number;
    product_name: string;
    variant_name: string | null;
    price: number;
    quantity: number;
    total: number;
  }>;
}

const statusLabels: Record<string, string> = {
  new: 'Новый',
  confirmed: 'Подтвержден',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.byId(Number(id)).then(({ data }) => setOrder(data.data || data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>;
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-600">Заказ не найден</h2>
        <Link href="/account?tab=orders" className="text-indigo-600 hover:underline mt-4 inline-block">Мои заказы</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Назад к заказам
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Заказ #{order.order_number}</h1>
          <p className="text-gray-500">{new Date(order.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="font-semibold text-gray-900 mb-4">Состав заказа</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    {item.variant_name && <p className="text-sm text-gray-500">{item.variant_name}</p>}
                    <p className="text-sm text-gray-500">{item.quantity} × {item.price.toLocaleString()} ₽</p>
                  </div>
                  <span className="font-bold">{item.total.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          </div>

          {order.note && (
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="font-semibold text-gray-900 mb-2">Комментарий</h3>
              <p className="text-gray-600">{order.note}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="font-semibold text-gray-900 mb-4">Детали заказа</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Клиент</span>
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span>{order.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Телефон</span>
                <span>{order.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Доставка</span>
                <span>{order.delivery_method === 'courier' ? 'Курьер' : order.delivery_method === 'pickup' ? 'Самовывоз' : 'Почта'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Оплата</span>
                <span>{order.payment_method === 'card' ? 'Карта' : 'Наличные'}</span>
              </div>
              {order.address_data?.address && (
                <div>
                  <p className="text-gray-500 mb-1">Адрес</p>
                  <p className="font-medium">{order.address_data.address}, {order.address_data.city}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <h3 className="font-semibold text-gray-900 mb-4">Сумма</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Подытог</span>
                <span>{order.subtotal.toLocaleString()} ₽</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Скидка</span>
                  <span>-{order.discount.toLocaleString()} ₽</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Доставка</span>
                <span>{order.shipping_cost > 0 ? `${order.shipping_cost.toLocaleString()} ₽` : 'Бесплатно'}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Итого</span>
                <span className="text-indigo-600">{order.total.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
