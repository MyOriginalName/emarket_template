'use client';

import { useEffect, useState } from 'react';
import { Search, Shield, Trash2 } from 'lucide-react';
import { admin } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  orders_count: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async (s = '') => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (s) params.search = s;
      const { data } = await admin.users.all(params);
      setUsers(data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (user: User) => {
    try {
      await admin.users.update(user.id, { is_admin: !user.is_admin });
      toast.success(user.is_admin ? 'Права администратора отозваны' : 'Назначен администратором');
      load(search);
    } catch { toast.error('Ошибка'); }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить пользователя?')) return;
    try { await admin.users.delete(id); toast.success('Удалено'); load(search); }
    catch { toast.error('Ошибка'); }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Поиск..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(search)}
            className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full" />
        </div>
        <button onClick={() => load(search)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Поиск</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-4 font-medium text-gray-500">Имя</th>
              <th className="p-4 font-medium text-gray-500">Email</th>
              <th className="p-4 font-medium text-gray-500">Телефон</th>
              <th className="p-4 font-medium text-gray-500">Заказов</th>
              <th className="p-4 font-medium text-gray-500">Роль</th>
              <th className="p-4 font-medium text-gray-500">Дата</th>
              <th className="p-4 font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Загрузка...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Нет пользователей</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-gray-500">{u.email}</td>
                <td className="p-4 text-gray-500">{u.phone || '—'}</td>
                <td className="p-4">{u.orders_count}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${u.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.is_admin ? 'Админ' : 'Пользователь'}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {!u.is_admin && (
                      <>
                        <button onClick={() => toggleAdmin(u)} className="p-1.5 text-gray-400 hover:text-purple-600" title="Назначить админом">
                          <Shield className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(u.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
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
