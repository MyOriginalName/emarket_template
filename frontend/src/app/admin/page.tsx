'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, Users as UsersIcon, TrendingUp, Calendar } from 'lucide-react';
import { admin } from '@/lib/api';

interface DashboardData {
  revenue_today: number;
  orders_today: number;
  total_products: number;
  total_users: number;
  total_orders: number;
  total_revenue: number;
  revenue_chart: { date: string; revenue: number; orders_count: number }[];
  orders_by_status: { status: string; count: number }[];
  popular_products: { product_name: string; total_qty: number; total_revenue: number }[];
}

const statusLabels: Record<string, string> = {
  new: 'Новые', confirmed: 'Подтверждены', processing: 'В обработке',
  shipped: 'Отправлены', delivered: 'Доставлены', cancelled: 'Отменены',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.dashboard().then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
  }

  if (!data) return <p className="text-gray-500">Ошибка загрузки</p>;

  const cards = [
    { label: 'Выручка сегодня', value: `${data.revenue_today.toLocaleString()} ₽`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Заказов сегодня', value: data.orders_today.toString(), icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Всего товаров', value: data.total_products.toString(), icon: Package, color: 'bg-purple-500' },
    { label: 'Пользователей', value: data.total_users.toString(), icon: UsersIcon, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold text-gray-900 mb-4">Заказы по статусам</h3>
          <div className="space-y-3">
            {data.orders_by_status.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{statusLabels[s.status] || s.status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(s.count / Math.max(...data.orders_by_status.map(x => x.count))) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold text-gray-900 mb-4">Статистика</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Всего заказов</span>
              <span className="font-medium">{data.total_orders}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Общая выручка</span>
              <span className="font-medium">{data.total_revenue.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Средний чек</span>
              <span className="font-medium">{data.total_orders > 0 ? Math.round(data.total_revenue / data.total_orders).toLocaleString() : 0} ₽</span>
            </div>
          </div>
        </div>
      </div>

      {data.popular_products.length > 0 && (
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold text-gray-900 mb-4">Популярные товары</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">Товар</th>
                  <th className="pb-3 font-medium text-gray-500">Продано</th>
                  <th className="pb-3 font-medium text-gray-500">Выручка</th>
                </tr>
              </thead>
              <tbody>
                {data.popular_products.map((p, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="py-3 font-medium">{p.product_name}</td>
                    <td className="py-3">{p.total_qty} шт.</td>
                    <td className="py-3">{p.total_revenue.toLocaleString()} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.revenue_chart.length > 0 && (
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold text-gray-900 mb-4">Динамика выручки</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">Дата</th>
                  <th className="pb-3 font-medium text-gray-500">Заказы</th>
                  <th className="pb-3 font-medium text-gray-500">Выручка</th>
                </tr>
              </thead>
              <tbody>
                {data.revenue_chart.slice(-14).map((r, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="py-3">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3">{r.orders_count}</td>
                    <td className="py-3">{r.revenue.toLocaleString()} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
