<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $days = (int) ($request->days ?? 30);

        $revenueToday = Order::whereDate('created_at', Carbon::today())
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        $ordersToday = Order::whereDate('created_at', Carbon::today())->count();

        $totalProducts = Product::count();
        $totalUsers = User::count();
        $totalOrders = Order::count();
        $totalRevenue = Order::whereNotIn('status', ['cancelled'])->sum('total');

        $revenueChart = Order::where('created_at', '>=', Carbon::now()->subDays($days))
            ->whereNotIn('status', ['cancelled'])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        $popularProducts = OrderItem::select(
            'product_name',
            DB::raw('SUM(quantity) as total_qty'),
            DB::raw('SUM(total) as total_revenue')
        )
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->take(10)
            ->get();

        return response()->json([
            'revenue_today' => (float) $revenueToday,
            'orders_today' => $ordersToday,
            'total_products' => $totalProducts,
            'total_users' => $totalUsers,
            'total_orders' => $totalOrders,
            'total_revenue' => (float) $totalRevenue,
            'revenue_chart' => $revenueChart,
            'orders_by_status' => $ordersByStatus,
            'popular_products' => $popularProducts,
        ]);
    }
}
