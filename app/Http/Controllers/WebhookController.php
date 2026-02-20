<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierController;

class WebhookController extends CashierController
{
    /**
     * Handle customer subscription updated.
     */
    protected function handleCustomerSubscriptionUpdated(array $payload): void
    {
        parent::handleCustomerSubscriptionUpdated($payload);

        // Custom logic when subscription is updated
        // e.g., send notification, log event
    }

    /**
     * Handle customer subscription deleted.
     */
    protected function handleCustomerSubscriptionDeleted(array $payload): void
    {
        parent::handleCustomerSubscriptionDeleted($payload);

        // Custom logic when subscription is canceled
        // e.g., send notification, log event
    }

    /**
     * Handle invoice payment succeeded.
     */
    protected function handleInvoicePaymentSucceeded(array $payload): void
    {
        parent::handleInvoicePaymentSucceeded($payload);

        // Custom logic when payment succeeds
        // e.g., send thank you email
    }

    /**
     * Handle invoice payment failed.
     */
    protected function handleInvoicePaymentFailed(array $payload): void
    {
        parent::handleInvoicePaymentFailed($payload);

        // Custom logic when payment fails
        // e.g., send warning email
    }
}
