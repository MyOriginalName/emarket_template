'use client';

import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { cart as cartApi } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    compare_price: number | null;
    image: string | null;
    rating: number;
    quantity: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { setCart } = useStore();

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await cartApi.add({ product_id: product.id, quantity: 1 });
      setCart(data);
      toast.success('Добавлено в корзину');
    } catch {
      toast.error('Ошибка при добавлении');
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="group bg-white rounded-xl border hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}
        {product.compare_price && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            -{Math.round((1 - product.price / product.compare_price) * 100)}%
          </span>
        )}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Нет в наличии</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-500">{product.rating || 'Нет оценок'}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-indigo-600">{product.price.toLocaleString()} ₽</span>
            {product.compare_price && (
              <span className="text-sm text-gray-400 line-through ml-2">{product.compare_price.toLocaleString()} ₽</span>
            )}
          </div>
          {product.quantity > 0 && (
            <button onClick={addToCart} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
