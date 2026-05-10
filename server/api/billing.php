<?php
// server/api/billing.php
require_once 'config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$headers = getallheaders();
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
    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? 'checkout';

        if ($action === 'checkout') {
            $planId = intval($data['planId'] ?? 0);
            
            if ($planId === 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid Plan ID selected."]);
                exit;
            }

            // 1. Check if we are in testing mode
            $stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'is_testing_mode'");
            $stmt->execute();
            $isTesting = (int)($stmt->fetchColumn() ?? 1);

            $stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'stripe_secret_key'");
            $stmt->execute();
            $row = $stmt->fetch();
            $stripeSecret = $row['setting_value'] ?? '';

            if ($isTesting || empty($stripeSecret)) {
                // Simulation Mode
                $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
                $pdo->prepare("UPDATE tenants SET plan_id = ?, expires_at = ?, is_active = 1 WHERE id = ?")->execute([$planId, $expiresAt, $tenantId]);
                
                // RECORD IN LEDGER
                $stmt = $pdo->prepare("SELECT price FROM plans WHERE id = ?");
                $stmt->execute([$planId]);
                $price = $stmt->fetchColumn();
                $pdo->prepare("INSERT INTO subscriptions_ledger (tenant_id, plan_id, amount) VALUES (?, ?, ?)")->execute([$tenantId, $planId, $price]);

                $msg = $isTesting ? "Simulation: Upgrade successful! (Platform is in Testing Mode)" : "Simulation: Upgrade successful! (No Stripe keys found)";
                echo json_encode(["status" => "success", "message" => $msg, "simulation" => true]);
                exit;
            }

            // 2. Real Stripe Integration
            require_once 'vendor/autoload.php';
            \Stripe\Stripe::setApiKey($stripeSecret);

            // Get plan details for checkout
            $stmt = $pdo->prepare("SELECT name, price FROM plans WHERE id = ?");
            $stmt->execute([$planId]);
            $plan = $stmt->fetch();

            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Bee Chat ' . $plan['name'],
                        ],
                        'unit_amount' => intval($plan['price']) * 100, // Stripe uses cents
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => 'http://localhost:5173/dashboard/settings?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => 'http://localhost:5173/dashboard/settings',
                'metadata' => [
                    'tenant_id' => $tenantId,
                    'plan_id' => $planId
                ]
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
