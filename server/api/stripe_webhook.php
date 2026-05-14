<?php
require_once 'config.php';

$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

// You should fetch the endpoint secret from platform_settings
$stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'stripe_webhook_secret'");
$stmt->execute();
$endpoint_secret = $stmt->fetchColumn() ?? '';

if (empty($endpoint_secret)) {
    // If no webhook secret, we blindly accept the payload for testing, 
    // but in prod this is insecure!
    $event = json_decode($payload);
} else {
    require_once 'vendor/autoload.php';
    try {
        $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
    } catch(\UnexpectedValueException $e) {
        http_response_code(400); exit();
    } catch(\Stripe\Exception\SignatureVerificationException $e) {
        http_response_code(400); exit();
    }
}

// Handle the event
try {
    switch ($event->type) {
        case 'checkout.session.completed':
            $session = $event->data->object;
            $tenantId = $session->metadata->tenant_id ?? null;
            $planId = $session->metadata->plan_id ?? null;
            $interval = $session->metadata->interval ?? 'monthly';
            $customerId = $session->customer;
            $subscriptionId = $session->subscription;

            if ($tenantId && $planId) {
                // Update Tenant with customer ID and active status
                $pdo->prepare("UPDATE tenants SET stripe_customer_id = ?, plan_id = ?, is_active = 1 WHERE id = ?")
                    ->execute([$customerId, $planId, $tenantId]);
                
                // Add to subscriptions
                $pdo->prepare("INSERT INTO subscriptions (tenant_id, plan_id, billing_interval, status, stripe_subscription_id) VALUES (?, ?, ?, 'active', ?)")
                    ->execute([$tenantId, $planId, $interval, $subscriptionId]);
            }
            break;
            
        case 'invoice.payment_succeeded':
            $invoice = $event->data->object;
            $customerId = $invoice->customer;
            $stripeSubId = $invoice->subscription;
            $amount = $invoice->amount_paid / 100;
            $pdfUrl = $invoice->hosted_invoice_url;
            $stripeInvoiceId = $invoice->id;

            // Find tenant by customer ID
            $stmt = $pdo->prepare("SELECT id FROM tenants WHERE stripe_customer_id = ?");
            $stmt->execute([$customerId]);
            $tenantId = $stmt->fetchColumn();

            if ($tenantId) {
                // Create invoice record
                $pdo->prepare("INSERT INTO invoices (tenant_id, stripe_invoice_id, amount, status, pdf_url) VALUES (?, ?, ?, 'paid', ?)")
                    ->execute([$tenantId, $stripeInvoiceId, $amount, $pdfUrl]);
                
                // Update subscription period end if available
                // We'd ideally pull current_period_end from a customer.subscription.updated event
            }
            break;

        case 'customer.subscription.updated':
            $sub = $event->data->object;
            $stripeSubId = $sub->id;
            $status = $sub->status;
            $periodEnd = date('Y-m-d H:i:s', $sub->current_period_end);
            $cancelAtEnd = $sub->cancel_at_period_end ? 1 : 0;

            $pdo->prepare("UPDATE subscriptions SET status = ?, current_period_end = ?, cancel_at_period_end = ? WHERE stripe_subscription_id = ?")
                ->execute([$status, $periodEnd, $cancelAtEnd, $stripeSubId]);
            break;

        case 'customer.subscription.deleted':
            $sub = $event->data->object;
            $stripeSubId = $sub->id;
            
            $pdo->prepare("UPDATE subscriptions SET status = 'canceled' WHERE stripe_subscription_id = ?")
                ->execute([$stripeSubId]);
            break;
    }

    http_response_code(200);
} catch (Exception $e) {
    http_response_code(500);
    echo $e->getMessage();
}
?>
