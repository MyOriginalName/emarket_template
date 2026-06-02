'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { admin } from '@/lib/api';
import toast from 'react-hot-toast';

interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  min_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', min_amount: '', usage_limit: '', expires_at: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await admin.coupons.all();
      setCoupons(data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        min_amount: form.min_amount ? parseFloat(form.min_amount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      };
      if (editing && editing.id) {
        await admin.coupons.update(editing.id, payload);
        toast.success('Купон обновлен');
      } else {
        await admin.coupons.create(payload);
        toast.success('Купон создан');
      }
      setShowForm(false); setEditing(null);
      setForm({ code: '', type: 'percent', value: '', min_amount: '', usage_limit: '', expires_at: '' });
      load();
    } catch { toast.error('Ошибка'); }
  };

  const edit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value.toString(),
      min_amount: c.min_amount?.toString() || '',
      usage_limit: c.usage_limit?.toString() || '',
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить купон?')) return;
    try { await admin.coupons.delete(id); toast.success('Удалено'); load(); }
    catch { toast.error('Ошибка'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Купоны</h3>
        <button onClick={() => { setEditing(null); setForm({ code: '', type: 'percent', value: '', min_amount: '', usage_limit: '', expires_at: '' }); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Редактировать' : 'Новый купон'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Код</label>
                <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm uppercase" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="percent">%</option><option value="fixed">Фикс</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Значение</label>
                  <input required type="number" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Мин. сумма</label>
                  <input type="number" value={form.min_amount} onChange={e => setForm(f => ({ ...f, min_amount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Лимит</label>
                  <input type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Истекает</label>
                <input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Отмена</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-4 font-medium text-gray-500">Код</th>
              <th className="p-4 font-medium text-gray-500">Тип</th>
              <th className="p-4 font-medium text-gray-500">Значение</th>
              <th className="p-4 font-medium text-gray-500">Использовано</th>
              <th className="p-4 font-medium text-gray-500">Лимит</th>
              <th className="p-4 font-medium text-gray-500">Статус</th>
              <th className="p-4 font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Загрузка...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Нет купонов</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4 font-medium uppercase">{c.code}</td>
                <td className="p-4 text-gray-500">{c.type === 'percent' ? '%' : '₽'}</td>
                <td className="p-4">{c.type === 'percent' ? `${c.value}%` : `${c.value.toLocaleString()} ₽`}</td>
                <td className="p-4">{c.used_count}</td>
                <td className="p-4">{c.usage_limit || '∞'}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'Активен' : 'Неактивен'}</span></td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => edit(c)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => remove(c.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
