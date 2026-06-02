<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'text' => 'nullable|string|max:2000',
        ]);

        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this product'], 422);
        }

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
            'rating' => $validated['rating'],
            'text' => $validated['text'] ?? null,
            'is_approved' => false,
        ]);

        return response()->json($review, 201);
    }

    public function my(Request $request): JsonResponse
    {
        $reviews = $request->user()
            ->reviews()
            ->with('product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }
}
