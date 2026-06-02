<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'compare_price' => $this->compare_price ? (float) $this->compare_price : null,
            'sku' => $this->sku,
            'quantity' => $this->quantity,
            'weight' => (float) $this->weight,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'attributes' => $this->attributes,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'variants' => $this->whenLoaded('variants'),
            'images' => $this->getMedia('images')->map(fn($m) => $m->getUrl()),
            'reviews' => $this->whenLoaded('reviews', fn() => $this->reviews->map(fn($r) => [
                'id' => $r->id,
                'user_name' => $r->user?->name,
                'rating' => $r->rating,
                'text' => $r->text,
                'created_at' => $r->created_at,
            ])),
            'rating' => $this->rating,
            'created_at' => $this->created_at,
        ];
    }
}
