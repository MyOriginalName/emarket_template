<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cartService
    ) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request);
        if (!$cart) {
            return response()->json(['items' => [], 'subtotal' => 0, 'total' => 0, 'items_count' => 0]);
        }
        $cart->load(['items.product', 'items.variant', 'coupon']);

        return response()->json([
            'id' => $cart->id,
            'items' => $cart->items->map(fn($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'image' => $item->product->getFirstMediaUrl('images'),
                ],
                'variant_name' => $item->variant?->name,
                'quantity' => $item->quantity,
                'price' => (float) $item->price,
                'total' => (float) ($item->price * $item->quantity),
            ]),
            'coupon' => $cart->coupon ? [
                'code' => $cart->coupon->code,
                'discount' => (float) $cart->discount,
            ] : null,
            'subtotal' => (float) $cart->subtotal,
            'discount' => (float) $cart->discount,
            'total' => (float) $cart->total,
            'items_count' => $cart->items_count,
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $cart = $this->cartService->getOrCreateCart($request);

        $existingItem = $cart->items()
            ->where('product_id', $validated['product_id'])
            ->where('variant_id', $validated['variant_id'] ?? null)
            ->first();

        if ($existingItem) {
            $existingItem->increment('quantity', $validated['quantity']);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $validated['product_id'],
                'variant_id' => $validated['variant_id'] ?? null,
                'quantity' => $validated['quantity'],
                'price' => $product->price,
            ]);
        }

        $cart->touch();

        return $this->show($request);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:cart_items,id',
            'quantity' => 'required|integer|min:0|max:99',
        ]);

        $cart = $this->cartService->getCart($request);
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $item = $cart->items()->find($validated['item_id']);
        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        if ($validated['quantity'] === 0) {
            $item->delete();
        } else {
            $item->update(['quantity' => $validated['quantity']]);
        }

        $cart->touch();

        return $this->show($request);
    }

    public function remove(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:cart_items,id',
        ]);

        $cart = $this->cartService->getCart($request);
        if ($cart) {
            $cart->items()->where('id', $validated['item_id'])->delete();
            $cart->touch();
        }

        return $this->show($request);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request);
        if ($cart) {
            $cart->items()->delete();
            $cart->update(['coupon_id' => null, 'discount' => 0]);
        }

        return $this->show($request);
    }
}
