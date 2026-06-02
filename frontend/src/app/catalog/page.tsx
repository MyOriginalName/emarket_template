'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { products as productsApi, categories as categoriesApi } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  image: string | null;
  rating: number;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  products_count: number;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page };
      const search = searchParams.get('search');
      const categorySlug = searchParams.get('category_slug');
      const sort = searchParams.get('sort');
      const direction = searchParams.get('direction');

      if (search) params.search = search;
      if (categorySlug) params.category_slug = categorySlug;
      if (sort) params.sort = sort;
      if (direction) params.direction = direction;
      if (priceRange.min) params.min_price = priceRange.min;
      if (priceRange.max) params.max_price = priceRange.max;

      const { data } = await productsApi.all(params);
      setProducts(data.data || []);
      setMeta(data.meta || { current_page: 1, last_page: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [searchParams, priceRange]);

  useEffect(() => {
    categoriesApi.all().then(({ data }) => setCategories(data.data || data));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <div className="flex gap-8">
      <aside className="w-64 shrink-0 hidden lg:block">
        <div className="bg-white rounded-xl p-6 border sticky top-24">
          <h3 className="font-semibold text-gray-900 mb-4">Категории</h3>
          <ul className="space-y-2">
            <li>
              <button onClick={() => updateParam('category_slug', null)}
                className={`text-sm ${!searchParams.get('category_slug') ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600'}`}>
                Все товары
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button onClick={() => updateParam('category_slug', cat.slug)}
                  className={`text-sm ${searchParams.get('category_slug') === cat.slug ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-600'}`}>
                  {cat.name} ({cat.products_count})
                </button>
              </li>
            ))}
          </ul>
          <hr className="my-4" />
          <h3 className="font-semibold text-gray-900 mb-4">Цена</h3>
          <div className="flex gap-2">
            <input type="number" placeholder="От" value={priceRange.min}
              onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
              className="w-full px-2 py-1 border rounded text-sm" />
            <input type="number" placeholder="До" value={priceRange.max}
              onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
              className="w-full px-2 py-1 border rounded text-sm" />
          </div>
          <button onClick={() => fetchProducts()}
            className="mt-2 w-full bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700">
            Применить
          </button>
          <hr className="my-4" />
          <h3 className="font-semibold text-gray-900 mb-4">Сортировка</h3>
          <select value={`${searchParams.get('sort') || ''}-${searchParams.get('direction') || ''}`}
            onChange={(e) => {
              const [sort, direction] = e.target.value.split('-');
              const params = new URLSearchParams(searchParams.toString());
              if (sort) { params.set('sort', sort); params.set('direction', direction || 'asc'); }
              else { params.delete('sort'); params.delete('direction'); }
              router.push(`/catalog?${params.toString()}`);
            }} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="-">По умолчанию</option>
            <option value="price-asc">Цена: по возрастанию</option>
            <option value="price-desc">Цена: по убыванию</option>
            <option value="name-asc">Название: А-Я</option>
            <option value="name-desc">Название: Я-А</option>
            <option value="created_at-desc">Новинки</option>
          </select>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {searchParams.get('search') ? `Поиск: "${searchParams.get('search')}"` : 'Каталог товаров'}
          </h1>
          <span className="text-sm text-gray-500">{meta.total} товаров</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-gray-600">Товары не найдены</h3>
            <p className="text-gray-400 mt-2">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => fetchProducts(page)}
                    className={`px-4 py-2 rounded-lg text-sm ${page === meta.current_page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>}>
        <CatalogContent />
      </Suspense>
    </div>
  );
}
