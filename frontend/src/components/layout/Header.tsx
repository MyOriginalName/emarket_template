'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, User, Search, Heart, Menu, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cart as cartApi } from '@/lib/api';

export default function Header() {
  const { user, cart, hydrated, setCart } = useStore();
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const { data } = await cartApi.show();
      setCart(data);
    } catch {
      // guest cart
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            eMarket
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/catalog" className="text-gray-600 hover:text-indigo-600 font-medium">
              Каталог
            </Link>
            {user?.is_admin && (
              <Link href="/admin" className="text-gray-600 hover:text-indigo-600 font-medium">
                Админка
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search) {
                    window.location.href = `/catalog?search=${encodeURIComponent(search)}`;
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/account" className="text-gray-600 hover:text-indigo-600">
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link href="/login" className="text-gray-600 hover:text-indigo-600">
                <User className="h-5 w-5" />
              </Link>
            )}

            <Link href="/account?tab=wishlist" className="text-gray-600 hover:text-indigo-600 relative">
              <Heart className="h-5 w-5" />
            </Link>

            <Link href="/cart" className="text-gray-600 hover:text-indigo-600 relative">
              <ShoppingCart className="h-5 w-5" />
              {cart && cart.items_count > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.items_count}
                </span>
              )}
            </Link>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden">
              {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden pb-4 border-t pt-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search) {
                    window.location.href = `/catalog?search=${encodeURIComponent(search)}`;
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Link href="/catalog" className="block py-2 text-gray-600">Каталог</Link>
            {user?.is_admin && (
              <Link href="/admin" className="block py-2 text-gray-600">Админка</Link>
            )}
            {!user && (
              <>
                <Link href="/login" className="block py-2 text-gray-600">Войти</Link>
                <Link href="/register" className="block py-2 text-gray-600">Регистрация</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
