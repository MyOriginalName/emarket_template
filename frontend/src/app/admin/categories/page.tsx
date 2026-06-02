'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { admin } from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  products_count: number;
  children: Category[];
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [form, setForm] = useState({ name: '', parent_id: '', description: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await admin.categories.all();
      setCategories(data.data || data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, parent_id: form.parent_id || null };
      if (editing && editing.id) {
        await admin.categories.update(editing.id, payload);
        toast.success('Категория обновлена');
      } else {
        await admin.categories.create(payload);
        toast.success('Категория создана');
      }
      setShowForm(false); setEditing(null); setForm({ name: '', parent_id: '', description: '' }); load();
    } catch { toast.error('Ошибка'); }
  };

  const edit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, parent_id: cat.parent_id?.toString() || '', description: '' });
    setShowForm(true);
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить категорию?')) return;
    try { await admin.categories.delete(id); toast.success('Удалено'); load(); }
    catch { toast.error('Ошибка'); }
  };

  const renderTree = (items: Category[], level = 0) => items.map((cat) => (
    <div key={cat.id}>
      <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 border-b" style={{ paddingLeft: `${16 + level * 24}px` }}>
        <div>
          <span className="font-medium">{cat.name}</span>
          <span className="text-gray-400 text-sm ml-2">({cat.products_count} товаров)</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => edit(cat)} className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
          <button onClick={() => remove(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {cat.children?.length > 0 && renderTree(cat.children, level + 1)}
    </div>
  ));

  const flattenCategories = (items: Category[], prefix = ''): { id: number; name: string }[] => {
    let result: { id: number; name: string }[] = [];
    for (const item of items) {
      result.push({ id: item.id, name: prefix + item.name });
      if (item.children?.length) result = result.concat(flattenCategories(item.children, prefix + '— '));
    }
    return result;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Все категории</h3>
        <button onClick={() => { setEditing(null); setForm({ name: '', parent_id: '', description: '' }); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Редактировать' : 'Новая категория'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Родительская категория</label>
                <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">— Корневая —</option>
                  {flattenCategories(categories).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Отмена</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Загрузка...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Нет категорий</div>
        ) : (
          renderTree(categories)
        )}
      </div>
    </div>
  );
}
