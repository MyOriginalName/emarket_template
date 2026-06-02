<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::active()
            ->withCount('products')
            ->get();

        return response()->json(CategoryResource::collection($categories));
    }

    public function tree(): JsonResponse
    {
        $categories = Category::active()
            ->withCount('products')
            ->get()
            ->toTree();

        return response()->json(CategoryResource::collection($categories));
    }

    public function show(Category $category): JsonResponse
    {
        $category->load('products');
        return response()->json(new CategoryResource($category));
    }
}
