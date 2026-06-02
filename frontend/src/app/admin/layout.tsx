'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, Layers, ShoppingCart, Tag, Users, LogOut, ChevronLeft } from 'lucide-react';
import { useStore } from '@/lib/store';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Товары', icon: Package },
  { href: '/admin/categories', label: 'Категории', icon: Layers },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingCart },
  { href: '/admin/coupons', label: 'Купоны', icon: Tag },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.is_admin) {
      router.push('/');
      return;
    }
    setAuthorized(true);
  }, []);

  if (!authorized) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white shrink-0 hidden lg:block">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-indigo-400">eMarket</Link>
          <p className="text-xs text-gray-400 mt-1">Панель управления</p>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" /> На сайт
          </Link>
        </div>
      </aside>
      <div className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {navItems.find(n => n.href === pathname)?.label || 'Администрирование'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); }}
              className="text-gray-400 hover:text-red-500">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
