<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(
        private readonly CartService $cartService
    ) {}

    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
        ]);

        $coupon = Coupon::where('code', $validated['code'])->valid()->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid or expired coupon'], 422);
        }

        $cart = $this->cartService->getCart($request);
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $subtotal = $cart->subtotal;

        if ($coupon->min_amount && $subtotal < $coupon->min_amount) {
            return response()->json([
                'message' => "Minimum order amount is {$coupon->min_amount}",
            ], 422);
        }

        $discount = $coupon->calculateDiscount($subtotal);

        $cart->update([
            'coupon_id' => $coupon->id,
            'discount' => $discount,
        ]);

        return response()->json([
            'message' => 'Coupon applied',
            'discount' => $discount,
        ]);
    }

    public function remove(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request);
        if ($cart) {
            $cart->update(['coupon_id' => null, 'discount' => 0]);
        }

        return response()->json(['message' => 'Coupon removed']);
    }
}
