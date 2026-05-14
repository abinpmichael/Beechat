<?php
// server/api/billing.php
require_once 'config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$headers = getAuthHeaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    exit;
}

$token = $matches[1];
$decoded = json_decode(base64_decode($token), true);
$tenantId = $decoded['tenant_id'];

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Return current subscription info
        $stmt = $pdo->prepare("
            SELECT s.*, p.name as plan_name, p.price, p.price_annual, p.max_websites, p.max_agents
            FROM subscriptions s
            JOIN plans p ON s.plan_id = p.id
            WHERE s.tenant_id = ? ORDER BY s.id DESC LIMIT 1
        ");
        $stmt->execute([$tenantId]);
        $sub = $stmt->fetch(PDO::FETCH_ASSOC);

        // Also get all invoices
        $invStmt = $pdo->prepare("SELECT * FROM invoices WHERE tenant_id = ? ORDER BY created_at DESC");
        $invStmt->execute([$tenantId]);
        $invoices = $invStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch all active plans
        $planStmt = $pdo->prepare("SELECT * FROM plans ORDER BY price ASC");
        $planStmt->execute();
        $allPlans = $planStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["subscription" => $sub, "invoices" => $invoices, "plans" => $allPlans]);
        exit;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? 'checkout';

        // Get Stripe Key
        $stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'stripe_secret_key'");
        $stmt->execute();
        $stripeSecret = $stmt->fetchColumn() ?? '';
        
        $stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'is_testing_mode'");
        $stmt->execute();
        $isTesting = (int)($stmt->fetchColumn() ?? 1);

        if ($action === 'checkout') {
            $planId = intval($data['planId'] ?? 0);
            $interval = $data['interval'] ?? 'monthly'; // 'monthly' or 'annual'
            
            if ($planId === 0) {
                http_response_code(400); echo json_encode(["error" => "Invalid Plan"]); exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM plans WHERE id = ?");
            $stmt->execute([$planId]);
            $plan = $stmt->fetch();

            if (!$plan) {
                http_response_code(404); echo json_encode(["error" => "Plan not found"]); exit;
            }

            // Price calculation
            $amount = $interval === 'annual' ? $plan['price_annual'] : $plan['price'];
            
            // If Free Plan, just activate directly
            if ($amount <= 0) {
                $pdo->prepare("UPDATE tenants SET plan_id = ?, is_active = 1 WHERE id = ?")->execute([$planId, $tenantId]);
                $pdo->prepare("INSERT INTO subscriptions (tenant_id, plan_id, billing_interval, status) VALUES (?, ?, ?, 'active')")
                    ->execute([$tenantId, $planId, $interval]);
                echo json_encode(["status" => "success", "url" => "/dashboard/settings", "message" => "Activated Free Plan"]);
                exit;
            }

            if ($isTesting || empty($stripeSecret)) {
                // Simulation Mode
                $expiresAt = $interval === 'annual' ? date('Y-m-d H:i:s', strtotime('+1 year')) : date('Y-m-d H:i:s', strtotime('+1 month'));
                $pdo->prepare("UPDATE tenants SET plan_id = ?, expires_at = ?, is_active = 1 WHERE id = ?")->execute([$planId, $expiresAt, $tenantId]);
                $pdo->prepare("INSERT INTO subscriptions (tenant_id, plan_id, billing_interval, status, current_period_end) VALUES (?, ?, ?, 'active', ?)")
                    ->execute([$tenantId, $planId, $interval, $expiresAt]);
                
                echo json_encode(["status" => "success", "url" => "/dashboard/settings?simulated=true", "message" => "Simulation Mode: Subscribed"]);
                exit;
            }

            require_once 'vendor/autoload.php';
            \Stripe\Stripe::setApiKey($stripeSecret);

            // In production, you would map to existing Stripe Prices, but dynamically generating them here for ease
            // Note: Stripe Checkout accepts price_data for recurring now, but requires a product.
            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Bee Chat ' . $plan['name'] . ' (' . ucfirst($interval) . ')',
                        ],
                        'unit_amount' => intval($amount * 100),
                        'recurring' => [
                            'interval' => $interval === 'annual' ? 'year' : 'month',
                        ]
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => 'http://localhost:5173/dashboard/settings?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => 'http://localhost:5173/dashboard/settings',
                'metadata' => [
                    'tenant_id' => $tenantId,
                    'plan_id' => $planId,
                    'interval' => $interval
                ]
            ]);

            echo json_encode(["status" => "success", "url" => $session->url]);
            exit;
        }

        if ($action === 'portal') {
            // Stripe Customer Portal
            if (empty($stripeSecret)) {
                echo json_encode(["error" => "Stripe not configured."]); exit;
            }
            require_once 'vendor/autoload.php';
            \Stripe\Stripe::setApiKey($stripeSecret);

            $stmt = $pdo->prepare("SELECT stripe_customer_id FROM tenants WHERE id = ?");
            $stmt->execute([$tenantId]);
            $customerId = $stmt->fetchColumn();

            if (!$customerId) {
                echo json_encode(["error" => "No billing history found."]); exit;
            }

            $session = \Stripe\BillingPortal\Session::create([
                'customer' => $customerId,
                'return_url' => 'http://localhost:5173/dashboard/settings',
            ]);

            echo json_encode(["status" => "success", "url" => $session->url]);
            exit;
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
