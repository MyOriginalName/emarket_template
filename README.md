# eMarket

Single-seller e-commerce platform built with **Laravel 13** (REST API) + **Next.js 16** (React SPA).

## Structure

```
emarket/
├── app/               # Laravel application
├── bootstrap/         # Laravel bootstrapping
├── config/            # Laravel configuration
├── database/          # Migrations, factories, seeders
├── frontend/          # Next.js SPA
├── public/            # Laravel public directory
├── routes/            # API routes
├── storage/           # Laravel storage
├── tests/             # PHP tests
├── artisan            # Laravel CLI
├── composer.json      # PHP dependencies
├── package.json       # Root orchestration scripts
└── .env               # Environment configuration
```

## Requirements

- PHP 8.3+
- Composer 2
- Node.js 20+
- MySQL 8+
- OpenSSL (for Laravel key generation)

## Setup

```bash
# 1. Install PHP dependencies
composer install

# 2. Environment configuration
cp .env.example .env
# Edit .env with your database credentials (DB_DATABASE, DB_USERNAME, DB_PASSWORD)

# 3. Generate application key
php artisan key:generate

# 4. Install frontend dependencies
cd frontend
npm install
cd ..

# 5. Create database and run migrations with demo data
php artisan migrate --seed

# 6. Create storage symlink
php artisan storage:link
```

## Development

Start both servers with a single command:

```bash
npm run dev
```

Or start them individually:

```bash
# Backend only (Laravel API on http://localhost:8000)
php artisan serve --port=8000

# Frontend only (Next.js on http://localhost:3000)
cd frontend && npm run dev
```

## Credentials (Demo Data)

| Role  | Email               | Password |
|-------|---------------------|----------|
| Admin | admin@emarket.local | password |
| User  | user@emarket.local  | password |

## Coupons (Demo)

| Code     | Type    | Discount |
|----------|---------|----------|
| WELCOME10 | percent | 10%      |
| FIXED500  | fixed   | 500₽     |

## Tech Stack

### Backend (Laravel)
- Laravel 13 with Sanctum Bearer-token auth
- MySQL with migrations & seeders
- REST API: 54 endpoints across 10 resource controllers
- Nested Set (alex&tau) for categories
- Spatie Media Library for images
- CartService with guest cart merge
- Coupons (fixed & percentage)
- Product variants support

### Frontend (Next.js)
- Next.js 16 App Router with TypeScript
- Tailwind CSS 4
- Zustand for state management
- Axios with auth/session interceptors
- Guest cart via localStorage session ID
- Admin panel with full CRUD & analytics
- Responsive design

## API Endpoints

All routes are prefixed with `/api/v1`:

- **Auth** – login, register, logout, profile
- **Catalog** – categories (tree), products (filtered + paginated), product detail
- **Cart** – add, update, remove items; apply/remove coupon
- **Checkout** – place order
- **Orders** – list, detail
- **Reviews** – create (purchased only)
- **Wishlist** – add, remove, list
- **Admin** – dashboard stats, full CRUD for products/categories/coupons/users, orders management