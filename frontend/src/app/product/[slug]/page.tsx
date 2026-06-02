'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingCart, Star, Minus, Plus, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { products as productsApi, cart as cartApi, wishlist as wishlistApi } from '@/lib/api';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  sku: string;
  quantity: number;
  weight: number | null;
  images: string[];
  rating: number;
  attributes: Record<string, string> | null;
  variants: { id: number; name: string; price: number | null; quantity: number }[];
  reviews: { id: number; user_name: string; rating: number; text: string; created_at: string }[];
  category: { id: number; name: string; slug: string };
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { setCart } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    productsApi.bySlug(slug)
      .then(({ data }) => setProduct(data.data || data))
      .finally(() => setLoading(false));
  }, [slug]);

  const addToCart = async () => {
    if (!product) return;
    try {
      const { data } = await cartApi.add({
        product_id: product.id,
        variant_id: selectedVariant,
        quantity,
      });
      setCart(data);
      toast.success('Добавлено в корзину');
    } catch {
      toast.error('Ошибка при добавлении');
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      const { data } = await wishlistApi.toggle(product.id);
      setInWishlist(data.in_wishlist);
      toast.success(data.in_wishlist ? 'Добавлено в избранное' : 'Удалено из избранного');
    } catch {
      toast.error('Ошибка');
    }
  };

  const currentPrice = selectedVariant
    ? product?.variants.find(v => v.id === selectedVariant)?.price || product?.price
    : product?.price;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>;
  }

  if (!product) {
    return <div className="text-center py-20"><h2 className="text-2xl font-bold text-gray-600">Товар не найден</h2></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square bg-white rounded-xl border overflow-hidden mb-4">
            {product.images?.[selectedImage] ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingCart className="h-24 w-24" />
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden shrink-0 ${i === selectedImage ? 'border-indigo-600' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating || '—'}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-500">{product.reviews?.length || 0} отзывов</span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-500">Арт. {product.sku}</span>
          </div>

          <div className="text-3xl font-bold text-indigo-600 mb-6">
            {(currentPrice ?? product.price).toLocaleString()} ₽
            {product.compare_price && (
              <span className="text-lg text-gray-400 line-through ml-3">{product.compare_price.toLocaleString()} ₽</span>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
          )}

          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Варианты:</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button key={v.id} onClick={() => setSelectedVariant(v.id)}
                    disabled={v.quantity === 0}
                    className={`px-4 py-2 rounded-lg border text-sm ${selectedVariant === v.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : v.quantity === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-600'}`}>
                    {v.name} — {(v.price ?? product.price).toLocaleString()} ₽
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Характеристики:</h3>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="py-2 text-gray-500 capitalize">{key}</td>
                      <td className="py-2 text-gray-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-50"><Minus className="h-4 w-4" /></button>
              <span className="px-6 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.quantity || 99, quantity + 1))}
                className="p-3 hover:bg-gray-50"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={addToCart} disabled={product.quantity === 0}
              className="flex-1 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {product.quantity === 0 ? 'Нет в наличии' : 'В корзину'}
            </button>
            <button onClick={toggleWishlist}
              className={`p-3 rounded-lg border ${inWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'hover:bg-gray-50'}`}>
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {product.weight && (
            <p className="text-sm text-gray-400 mt-4">Вес: {product.weight} кг</p>
          )}
        </div>
      </div>

      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Отзывы</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-6 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{review.user_name || 'Аноним'}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{review.rating}</span>
                  </div>
                </div>
                {review.text && <p className="text-gray-600">{review.text}</p>}
                <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
