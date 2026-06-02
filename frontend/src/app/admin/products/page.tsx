'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { admin } from '@/lib/api';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  is_active: boolean;
  category: { id: number; name: string } | null;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', price: '', quantity: '0', category_id: '', description: '', is_active: '1',
  });

  const load = async (s = '') => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (s) params.search = s;
      const { data } = await admin.products.all(params);
      setProducts(data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity), is_active: form.is_active === '1' };
      if (editing) {
        await admin.products.update(editing.id as number, payload);
        toast.success('Товар обновлен');
      } else {
        await admin.products.create(payload);
        toast.success('Товар создан');
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      load();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Ошибка');
    }
  };

  const edit = async (id: number) => {
    try {
      const { data } = await admin.products.byId(id);
      setEditing(data);
      setForm({
        name: data.name || '',
        sku: data.sku || '',
        price: data.price?.toString() || '',
        quantity: data.quantity?.toString() || '0',
        category_id: data.category_id?.toString() || '',
        description: data.description || '',
        is_active: data.is_active ? '1' : '0',
      });
      setShowForm(true);
    } catch { toast.error('Ошибка загрузки'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    try { await admin.products.delete(id); toast.success('Удалено'); load(); }
    catch { toast.error('Ошибка'); }
  };

  const resetForm = () => setForm({ name: '', sku: '', price: '', quantity: '0', category_id: '', description: '', is_active: '1' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Поиск..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(search)}
            className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64" />
        </div>
        <button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Редактировать' : 'Новый товар'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Артикул</label>
                  <input required value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
                  <input required type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
                  <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Активен</label>
                  <select value={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="1">Да</option><option value="0">Нет</option>
                  </select></div>
              </div>
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
              <th className="p-4 font-medium text-gray-500">Название</th>
              <th className="p-4 font-medium text-gray-500">Артикул</th>
              <th className="p-4 font-medium text-gray-500">Цена</th>
              <th className="p-4 font-medium text-gray-500">Остаток</th>
              <th className="p-4 font-medium text-gray-500">Статус</th>
              <th className="p-4 font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Загрузка...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Нет товаров</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-gray-500">{p.sku}</td>
                <td className="p-4 font-medium">{p.price.toLocaleString()} ₽</td>
                <td className="p-4">{p.quantity}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.is_active ? 'Активен' : 'Неактивен'}</span></td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => edit(p.id)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => remove(p.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
