<?php

use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/tree', [CategoryController::class, 'tree']);
Route::get('categories/{category}', [CategoryController::class, 'show']);

Route::get('products', [ProductController::class, 'index']);
Route::get('products/featured', [ProductController::class, 'featured']);
Route::get('products/{product:slug}', [ProductController::class, 'show']);

// Cart routes (session-based)
Route::post('cart/add', [CartController::class, 'add']);
Route::post('cart/remove', [CartController::class, 'remove']);
Route::post('cart/update', [CartController::class, 'update']);
Route::get('cart', [CartController::class, 'show']);
Route::delete('cart', [CartController::class, 'clear']);
Route::post('cart/apply-coupon', [CouponController::class, 'apply']);
Route::post('cart/remove-coupon', [CouponController::class, 'remove']);

// Checkout
Route::post('checkout', [CheckoutController::class, 'store']);

// Auth
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/user', [AuthController::class, 'user']);
    Route::put('auth/profile', [AuthController::class, 'updateProfile']);

    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);

    Route::post('reviews', [ReviewController::class, 'store']);
    Route::get('reviews/my', [ReviewController::class, 'my']);

    Route::get('wishlist', [WishlistController::class, 'index']);
    Route::post('wishlist', [WishlistController::class, 'toggle']);
    Route::delete('wishlist/{product}', [WishlistController::class, 'remove']);
});

// Admin routes
Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::apiResource('products', AdminProductController::class);
    Route::post('products/{product}/media', [AdminProductController::class, 'uploadMedia']);
    Route::delete('products/{product}/media/{media}', [AdminProductController::class, 'deleteMedia']);

    Route::apiResource('categories', AdminCategoryController::class);
    Route::post('categories/reorder', [AdminCategoryController::class, 'reorder']);

    Route::get('orders', [AdminOrderController::class, 'index']);
    Route::get('orders/{order}', [AdminOrderController::class, 'show']);
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

    Route::apiResource('coupons', AdminCouponController::class);
    Route::apiResource('users', AdminUserController::class);
});
