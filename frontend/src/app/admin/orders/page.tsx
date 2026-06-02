'use client';

import { useEffect, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { admin } from '@/lib/api';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  items: Array<Record<string, unknown>>;
}

const statuses = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusLabels: Record<string, string> = {
  new: 'Новый', confirmed: 'Подтвержден', processing: 'В обработке',
  shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменен',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const { data } = await admin.orders.all(params);
      setOrders(data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await admin.orders.updateStatus(id, status);
      toast.success('Статус обновлен');
      load();
      if (selected?.id === id) {
        setSelected(prev => prev ? { ...prev, status } : null);
      }
    } catch { toast.error('Ошибка'); }
  };

  const viewOrder = async (id: number) => {
    try {
      const { data } = await admin.orders.byId(id);
      setSelected(data.data || data);
    } catch { toast.error('Ошибка загрузки'); }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Поиск..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); }}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Все статусы</option>
          {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
        <button onClick={load} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Поиск</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-4 font-medium text-gray-500">№</th>
              <th className="p-4 font-medium text-gray-500">Клиент</th>
              <th className="p-4 font-medium text-gray-500">Сумма</th>
              <th className="p-4 font-medium text-gray-500">Статус</th>
              <th className="p-4 font-medium text-gray-500">Дата</th>
              <th className="p-4 font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Загрузка...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Нет заказов</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4 font-medium">#{o.order_number}</td>
                <td className="p-4">
                  <p className="font-medium">{o.customer_name}</p>
                  <p className="text-gray-400 text-xs">{o.customer_email}</p>
                </td>
                <td className="p-4 font-bold">{o.total.toLocaleString()} ₽</td>
                <td className="p-4">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs font-medium border ${
                      o.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                      o.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                    {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                  </select>
                </td>
                <td className="p-4 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <button onClick={() => viewOrder(o.id)} className="p-1.5 text-gray-400 hover:text-indigo-600">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Заказ #{selected.order_number}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><span className="text-gray-500">Клиент:</span> <span className="font-medium">{selected.customer_name}</span></div>
              <div><span className="text-gray-500">Email:</span> {selected.customer_email}</div>
              <div><span className="text-gray-500">Сумма:</span> <span className="font-bold">{selected.total.toLocaleString()} ₽</span></div>
              <div><span className="text-gray-500">Статус:</span>
                <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)}
                  className="ml-2 px-2 py-0.5 border rounded text-xs">
                  {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
              </div>
              <div><span className="text-gray-500">Дата:</span> {new Date(selected.created_at).toLocaleDateString()}</div>
            </div>
            {selected.items?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Состав заказа</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left"><th className="pb-2 text-gray-500">Товар</th><th className="pb-2 text-gray-500">Кол-во</th><th className="pb-2 text-gray-500">Цена</th><th className="pb-2 text-gray-500">Сумма</th></tr>
                  </thead>
                  <tbody>
                    {selected.items.map((item: Record<string, unknown>, i: number) => (
                      <tr key={i} className="border-b last:border-b-0">
                        <td className="py-2">{item.product_name as string}</td>
                        <td className="py-2">{item.quantity as number}</td>
                        <td className="py-2">{(item.price as number).toLocaleString()} ₽</td>
                        <td className="py-2 font-medium">{(item.total as number).toLocaleString()} ₽</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
