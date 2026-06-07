План реализации: eMarket — Интернет-магазин на Laravel + React
1. Архитектура проекта
emarket/
├── backend/          # Laravel API (REST + GraphQL)
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── Exports/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/         # React (Next.js или SPA)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── store/        # Zustand / Redux Toolkit
├── admin/            # React Admin Panel (или отдельная SPA)
│   ├── pages/
│   └── components/
└── docker/           # Docker Compose (nginx, php, mysql, redis)
Backend: Laravel 11 (REST API, Sanctum auth, Spatie Media Library, Laravel Cashier для платежей)
Frontend: React 18 + TypeScript, Next.js (SSR для SEO) или Vite SPA + Laravel Inertia
Admin: React Admin (ra-core) или кастомная админка на React
Database: PostgreSQL / MySQL + Redis (кэш, сессии, очереди)
Queue: Laravel Horizon (RabbitMQ / Redis)
2. Технологический стек (коммерчески обоснованный)
Компонент	Технология	Почему
Backend	Laravel 11	Быстрая разработка, огромное комьюнити, встроенный Queues, Cashier, Scout
API	REST + Laravel API Resources	Стандарт, легко интегрировать с любым фронтендом
Auth	Laravel Sanctum (SPA) / JWT (mobile)	Токен-базированная аутентификация
Frontend	Next.js 14 (SSR + App Router)	SEO критически важен для магазина — SSR обязательно
State	Zustand + React Query (TanStack Query)	Легковесный и производительный
Styling	Tailwind CSS + Headless UI / shadcn/ui	Быстрая разработка UI, доступность
Admin	React + React Admin	Мощная B2B-панель из коробки
Payment	Stripe / ЮKassa / Tinkoff	Гибкая интеграция платежей
Search	Meilisearch / Laravel Scout	Мгновенный полнотекстовый поиск
CDN Images	Cloudinary / Spatie Media Library	Оптимизация изображений, WebP
CI/CD	GitHub Actions + Laravel Forge / Deployer	Zero-downtime деплой
Monitoring	Sentry + Laravel Telescope	Ошибки и производительность
3. Модули и функциональность (по фазам)
Фаза 1 — MVP (8–10 недель)
Каталог товаров
- Категории (бесконечная вложенность, nested sets)
- Товары (вариации: размер/цвет, модификаторы)
- Медиа (изображения, видео, 360° просмотр)
- Фильтры (по цене, характеристикам, в наличии)
- Поиск (мгновенный, с подсказками)
- Сортировка (цена, новизна, популярность)
Корзина
- Гостевая корзина (localStorage) → после логина синхронизация с сервером
- Cross-sell / Upsell
- Купоны и промокоды
- Бесплатная доставка при N сумме
Оформление заказа
- One-page checkout
- Адрес (DaData / Google Places автодополнение)
- Способы доставки (СДЭК, Boxberry, Почта России — интеграция)
- Оплата (карты онлайн + наличные при получении)
- Статусы заказа (новый → подтверждён → сборка → доставка → завершён)
Личный кабинет покупателя
- Регистрация (email + соцсети)
- История заказов
- Избранное (Wishlist)
- Возвраты (создание заявки)
- Управление профилем
Админ-панель
- CRUD товары, категории, заказы, пользователи
- Менеджер купонов
- Отгрузка заказов (смена статуса)
- Уведомления (email: новый заказ, смена статуса)
- Базовая аналитика: продажи за день/неделю/месяц
Фаза 2 — Коммерческая (4–6 недель)
- SEO: мета-теги, Open Graph, JSON-LD (Schema.org), sitemap.xml, robots.txt
- Яндекс.Метрика / Google Analytics 4 + GTM
- Email-маркетинг (Laravel Notifications + Mailchimp / SendGrid)
- Отзывы и рейтинги на товары
- Рекомендации (на основе просмотров / покупок)
- Telegram / WhatsApp уведомления о заказах
- Мультиязычность + мультивалютность
- Мобильная адаптация (PWA)
Фаза 3 — Масштабирование (4–6 недель)
- Импорт/экспорт товаров (Excel, CSV, 1С, МойСклад)
- Интеграция с CRM (AmoCRM, Bitrix24)
- Интеграция с маркетплейсами (Ozon, WB, Яндекс.Маркет)
- Лояльность: бонусные баллы, реферальная программа
- Блог / Новости (для SEO-трафика)
- А/Б тестирование конверсий
4. Модели данных (ключевые сущности)
User: id, name, email, password, phone, avatar, is_admin, email_verified_at
Category: id, parent_id, name, slug, description, image, _lft, _rgt (nested set)
Product: id, category_id, name, slug, description, price, compare_price, sku, quantity, is_active, weight
ProductVariant: id, product_id, name, price, sku, quantity, image
ProductAttribute: id, product_id, name, value (JSON — для фильтров)
Cart: id, user_id, session_id, coupon_id, total
CartItem: id, cart_id, product_id, variant_id, quantity, price
Order: id, user_id, status, total, subtotal, shipping_cost, discount, payment_method, delivery_method
OrderItem: id, order_id, product_id, variant_id, quantity, price
Delivery: id, order_id, address, city, region, zip, track_number, status
Payment: id, order_id, method, transaction_id, status, amount
Review: id, user_id, product_id, rating, text, is_approved
Coupon: id, code, discount_type, value, min_amount, usage_limit, expires_at
5. API Endpoints (основные)
# Публичные
GET  /api/categories              # Дерево категорий
GET  /api/products                # Список с фильтрацией, пагинацией
GET  /api/products/{slug}         # Детальная карточка
POST /api/cart                    # Добавить в корзину
GET  /api/cart                    # Текущая корзина
POST /api/cart/apply-coupon       # Применить купон
POST /api/checkout                # Оформить заказ
POST /api/webhooks/{provider}     # Webhook от платежной системы

# Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/user

# Личный кабинет
GET  /api/orders                  # История
GET  /api/orders/{id}             # Детали
POST /api/reviews                 # Оставить отзыв
POST /api/wishlist                # Избранное

# Админ (API ресурсы с фильтрацией)
GET  /api/admin/products          # + filters, sort, include
POST /api/admin/products
PUT  /api/admin/products/{id}
DELETE /api/admin/products/{id}
GET  /api/admin/orders
PUT  /api/admin/orders/{id}/status
GET  /api/admin/dashboard         # Аналитика
6. Структура фронтенда (Next.js)
frontend/
├── app/
│   ├── page.tsx                  # Главная (хиты, новинки)
│   ├── catalog/[slug]/           # Категория + фильтры (SSR)
│   ├── product/[slug]/           # Карточка товара (SSR + ISR)
│   ├── cart/                     # Корзина
│   ├── checkout/                 # Оформление
│   ├── account/                  # Личный кабинет
│   └── login | register/
├── components/
│   ├── ui/                       # shadcn/ui компоненты
│   ├── layout/                   # Header, Footer, Sidebar
│   ├── product/                  # ProductCard, ProductGallery, etc.
│   └── cart/                     # CartItem, CartSummary
├── lib/
│   ├── api.ts                    # Axios instance + interceptors
│   ├── store.ts                  # Zustand stores
│   └── utils.ts                  # Форматирование цен, дат
└── middleware.ts                 # Next.js Auth middleware
Коммерчески важные моменты:
- SSG/ISR для каталога — молниеносная загрузка страниц
- Streaming SSR для страниц с тяжёлым контентом
- Edge caching через CDN (Vercel / Cloudflare)
- Оптимизация Core Web Vitals (LCP < 2.5s, CLS < 0.1)