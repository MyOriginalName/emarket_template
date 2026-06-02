<?php

namespace App\Services;

use App\Models\Cart;
use Illuminate\Http\Request;

class CartService
{
    public function getCart(Request $request): ?Cart
    {
        if ($request->user()) {
            return Cart::with('items')
                ->where('user_id', $request->user()->id)
                ->whereNull('session_id')
                ->latest()
                ->first();
        }

        $sessionId = $request->header('X-Session-ID');
        if (!$sessionId) {
            return null;
        }

        return Cart::with('items')
            ->where('session_id', $sessionId)
            ->latest()
            ->first();
    }

    public function getOrCreateCart(Request $request): Cart
    {
        $cart = $this->getCart($request);

        if (!$cart) {
            $data = [];

            if ($request->user()) {
                $data['user_id'] = $request->user()->id;
            } else {
                $sessionId = $request->header('X-Session-ID', uniqid('sess_', true));
                $data['session_id'] = $sessionId;
            }

            $cart = Cart::create($data);
        }

        return $cart;
    }

    public function mergeGuestCart(string $sessionId, int $userId): void
    {
        $guestCart = Cart::with('items')
            ->where('session_id', $sessionId)
            ->latest()
            ->first();

        $userCart = Cart::where('user_id', $userId)
            ->whereNull('session_id')
            ->latest()
            ->first();

        if (!$guestCart) return;

        if (!$userCart) {
            $guestCart->update(['user_id' => $userId, 'session_id' => null]);
            return;
        }

        foreach ($guestCart->items as $item) {
            $existing = $userCart->items()
                ->where('product_id', $item->product_id)
                ->where('variant_id', $item->variant_id)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $item->quantity);
            } else {
                $item->update(['cart_id' => $userCart->id]);
            }
        }

        $guestCart->delete();
    }
}
