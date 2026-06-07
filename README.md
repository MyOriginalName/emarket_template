# eMarket

Однопродавцовая e-commerce платформа на **Laravel 13** (REST API) + **Next.js 16** (React SPA).

## Структура

```
emarket/
├── app/               # Laravel приложение
├── bootstrap/         # Загрузчик Laravel
├── config/            # Конфигурация Laravel
├── database/          # Миграции, фабрики, сидеры
├── frontend/          # Next.js SPA
├── public/            # Публичная директория Laravel
├── routes/            # API маршруты
├── storage/           # Хранилище Laravel
├── tests/             # PHP тесты
├── artisan            # Laravel CLI
├── composer.json      # PHP зависимости
├── package.json       # Корневые скрипты
└── .env               # Конфигурация окружения
```

## Требования

- PHP 8.3+
- Composer 2
- Node.js 20+
- MySQL 8+
- OpenSSL (для генерации ключа Laravel)

## Установка

```bash
# 1. Установка PHP зависимостей
composer install

# 2. Конфигурация окружения
cp .env.example .env
# Отредактируйте .env: укажите данные БД (DB_DATABASE, DB_USERNAME, DB_PASSWORD)

# 3. Генерация ключа приложения
php artisan key:generate

# 4. Установка зависимостей фронтенда
cd frontend
npm install
cd ..

# 5. Создание БД и запуск миграций с демо-данными
php artisan migrate --seed

# 6. Создание симлинка для storage
php artisan storage:link
```

## Запуск (разработка)

Запуск обоих серверов одной командой:

```bash
npm run dev
```

Или по отдельности:

```bash
# Бэкенд (Laravel API на http://localhost:8000)
php artisan serve --port=8000

# Фронтенд (Next.js на http://localhost:3000)
cd frontend && npm run dev
```

## Учётные записи (демо-данные)

| Роль  | Email               | Пароль    |
|-------|---------------------|-----------|
| Админ | admin@emarket.local | password  |
| Пользователь | user@emarket.local  | password  |

## Купоны (демо)

| Код       | Тип      | Скидка    |
|-----------|----------|-----------|
| WELCOME10 | percent  | 10%       |
| FIXED500  | fixed    | 500₽      |

## Технологии

### Бэкенд (Laravel)
- Laravel 13 с Sanctum Bearer-token аутентификацией
- MySQL с миграциями и сидерами
- REST API: 54 эндпоинта, 10 контроллеров ресурсов
- Nested Set (alex&tau) для категорий
- Spatie Media Library для изображений
- CartService с объединением гостевой корзины
- Купоны (фиксированные и процентные)
- Поддержка вариантов товаров

### Фронтенд (Next.js)
- Next.js 16 App Router с TypeScript
- Tailwind CSS 4
- Zustand для управления состоянием
- Axios с перехватчиками авторизации/сессий
- Гостевая корзина через session ID в localStorage
- Админ-панель с полным CRUD и аналитикой
- Адаптивный дизайн

## API Endpoints

Все маршруты имеют префикс `/api/v1`:

- **Auth** – вход, регистрация, выход, профиль
- **Catalog** – категории (дерево), товары (фильтрация + пагинация), детальная страница товара
- **Cart** – добавление, обновление, удаление товаров; применение/удаление купона
- **Checkout** – оформление заказа
- **Orders** – список заказов, детали
- **Reviews** – создание отзыва (только купившим)
- **Wishlist** – добавление, удаление, список
- **Admin** – статистика дашборда, полный CRUD товаров/категорий/купоны/пользователи, управление заказами
