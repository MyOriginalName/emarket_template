<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Администратор',
            'email' => 'admin@emarket.local',
            'password' => Hash::make('password'),
            'phone' => '+7 (800) 123-45-67',
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);

        // Users
        User::create([
            'name' => 'Иван Петров',
            'email' => 'user@emarket.local',
            'password' => Hash::make('password'),
            'phone' => '+7 (999) 888-77-66',
            'is_admin' => false,
            'email_verified_at' => now(),
        ]);

        // Categories
        $electronics = Category::create(['name' => 'Электроника', 'slug' => 'elektronika']);
        $clothing = Category::create(['name' => 'Одежда', 'slug' => 'odezhda']);
        $home = Category::create(['name' => 'Дом и сад', 'slug' => 'dom-i-sad']);
        $sport = Category::create(['name' => 'Спорт', 'slug' => 'sport']);

        $smartphones = Category::create(['name' => 'Смартфоны', 'slug' => 'smartfony', 'parent_id' => $electronics->id]);
        $laptops = Category::create(['name' => 'Ноутбуки', 'slug' => 'noutbuki', 'parent_id' => $electronics->id]);
        $mens = Category::create(['name' => 'Мужская', 'slug' => 'muzhskaya', 'parent_id' => $clothing->id]);
        $womens = Category::create(['name' => 'Женская', 'slug' => 'zhenskaya', 'parent_id' => $clothing->id]);

        // Products
        $products = [
            ['name' => 'Смартфон Galaxy S25', 'slug' => 'smartfon-galaxy-s25', 'category_id' => $smartphones->id, 'price' => 89990, 'compare_price' => 99990, 'sku' => 'PHN-001', 'quantity' => 50, 'is_featured' => true],
            ['name' => 'iPhone 16 Pro', 'slug' => 'iphone-16-pro', 'category_id' => $smartphones->id, 'price' => 119990, 'compare_price' => null, 'sku' => 'PHN-002', 'quantity' => 30, 'is_featured' => true],
            ['name' => 'Ноутбук ThinkPad X1', 'slug' => 'noutbuk-thinkpad-x1', 'category_id' => $laptops->id, 'price' => 149990, 'compare_price' => 179990, 'sku' => 'LAP-001', 'quantity' => 15, 'is_featured' => true],
            ['name' => 'MacBook Air M4', 'slug' => 'macbook-air-m4', 'category_id' => $laptops->id, 'price' => 129990, 'compare_price' => null, 'sku' => 'LAP-002', 'quantity' => 20, 'is_featured' => true],
            ['name' => 'Футболка хлопковая', 'slug' => 'futbolka-hlopkovaya', 'category_id' => $mens->id, 'price' => 1990, 'compare_price' => 2490, 'sku' => 'CLT-001', 'quantity' => 200, 'is_featured' => false],
            ['name' => 'Платье летнее', 'slug' => 'plate-letnee', 'category_id' => $womens->id, 'price' => 3990, 'compare_price' => null, 'sku' => 'CLT-002', 'quantity' => 80, 'is_featured' => true],
            ['name' => 'Набор кухонных ножей', 'slug' => 'nabor-kuhonnyh-nozhey', 'category_id' => $home->id, 'price' => 4990, 'compare_price' => 5990, 'sku' => 'HOM-001', 'quantity' => 60, 'is_featured' => false],
            ['name' => 'Кроссовки беговые', 'slug' => 'krossovki-begovye', 'category_id' => $sport->id, 'price' => 7990, 'compare_price' => null, 'sku' => 'SPT-001', 'quantity' => 45, 'is_featured' => true],
            ['name' => 'Умные часы Pro', 'slug' => 'umnye-chasy-pro', 'category_id' => $electronics->id, 'price' => 24990, 'compare_price' => 29990, 'sku' => 'ELC-001', 'quantity' => 35, 'is_featured' => true],
            ['name' => 'Беспроводные наушники', 'slug' => 'besprovodnye-naushniki', 'category_id' => $electronics->id, 'price' => 8990, 'compare_price' => null, 'sku' => 'ELC-002', 'quantity' => 100, 'is_featured' => false],
        ];

        foreach ($products as $data) {
            Product::create($data);
        }

        // Variants for clothing
        $shirt = Product::where('sku', 'CLT-001')->first();
        if ($shirt) {
            foreach (['S', 'M', 'L', 'XL'] as $size) {
                ProductVariant::create([
                    'product_id' => $shirt->id,
                    'name' => "Размер {$size}",
                    'sku' => "CLT-001-{$size}",
                    'price' => null,
                    'quantity' => 50,
                    'options' => ['size' => $size],
                ]);
            }
        }

        // Coupons
        Coupon::create([
            'code' => 'WELCOME10',
            'type' => 'percent',
            'value' => 10,
            'min_amount' => 1000,
            'usage_limit' => 100,
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'FIXED500',
            'type' => 'fixed',
            'value' => 500,
            'min_amount' => 5000,
            'usage_limit' => 50,
            'is_active' => true,
        ]);
    }
}
