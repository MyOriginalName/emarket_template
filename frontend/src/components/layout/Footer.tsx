import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">eMarket</h3>
            <p className="text-sm">Ваш надежный интернет-магазин с широким ассортиментом товаров по лучшим ценам.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Категории</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalog" className="hover:text-white">Все товары</Link></li>
              <li><Link href="/catalog?sort=price&direction=asc" className="hover:text-white">Новинки</Link></li>
              <li><Link href="/catalog?sort=price&direction=asc" className="hover:text-white">Хиты продаж</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Покупателям</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/cart" className="hover:text-white">Корзина</Link></li>
              <li><Link href="/account" className="hover:text-white">Личный кабинет</Link></li>
              <li><Link href="/account?tab=orders" className="hover:text-white">Мои заказы</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: info@emarket.local</li>
              <li>Телефон: +7 (800) 123-45-67</li>
              <li>Пн-Пт: 9:00 - 18:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} eMarket. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
