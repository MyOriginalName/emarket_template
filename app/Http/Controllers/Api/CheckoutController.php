<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cartService
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'delivery_method' => 'required|string|in:courier,pickup,post',
            'payment_method' => 'required|string|in:card,cash',
            'address' => 'required_if:delivery_method,courier,post|string|max:500',
            'city' => 'required_if:delivery_method,courier,post|string|max:255',
            'region' => 'nullable|string|max:255',
            'zip' => 'nullable|string|max:20',
            'note' => 'nullable|string|max:1000',
        ]);

        $cart = $this->cartService->getCart($request);
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        $shippingCost = $validated['delivery_method'] === 'courier' ? 500 : 0;

        $order = DB::transaction(function () use ($cart, $validated, $shippingCost) {
            $order = Order::create([
                'user_id' => $request->user()?->id,
                'status' => 'new',
                'subtotal' => $cart->subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => $cart->discount,
                'total' => $cart->subtotal + $shippingCost - $cart->discount,
                'payment_method' => $validated['payment_method'],
                'delivery_method' => $validated['delivery_method'],
                'note' => $validated['note'] ?? null,
                'address_data' => [
                    'address' => $validated['address'] ?? '',
                    'city' => $validated['city'] ?? '',
                    'region' => $validated['region'] ?? '',
                    'zip' => $validated['zip'] ?? '',
                ],
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'product_name' => $item->product->name,
                    'variant_name' => $item->variant?->name,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->price * $item->quantity,
                ]);

                $item->product->decrement('quantity', $item->quantity);
            }

            $cart->items()->delete();
            $cart->update(['coupon_id' => null, 'discount' => 0]);

            if ($cart->coupon) {
                $cart->coupon->increment('used_count');
            }

            return $order;
        });

        return response()->json([
            'order' => $order->load('items'),
        ], 201);
    }
}
