<?php

namespace App\Services;

use App\Models\Order;

class PaymentService
{
    public function processPayment(Order $order, array $paymentData): array
    {
        if ($order->payment_method === 'card') {
            return $this->processCardPayment($order, $paymentData);
        }

        return [
            'success' => true,
            'message' => 'Payment on delivery',
            'redirect_url' => null,
        ];
    }

    private function processCardPayment(Order $order, array $paymentData): array
    {
        return [
            'success' => true,
            'message' => 'Payment processed',
            'redirect_url' => null,
            'transaction_id' => 'txn_' . uniqid(),
        ];
    }
}
