<?php
// server/api/upgrade.php
require_once 'config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$headers = getAuthHeaders();
$decoded = decodeJwt($headers);

if (!$decoded || empty($decoded['tenant_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized access. Please log in again."]);
    exit;
}

try {
    $tenantId = $decoded['tenant_id'];

    $data = json_decode(file_get_contents("php://input"), true);
    $planId = (int)($data['plan_id'] ?? 0);

    if ($planId <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid plan ID specified."]);
        exit;
    }

    // Check if the plan actually exists
    $planCheck = $pdo->prepare("SELECT id, name FROM plans WHERE id = ?");
    $planCheck->execute([$planId]);
    $plan = $planCheck->fetch();
    if (!$plan) {
        http_response_code(404);
        echo json_encode(["error" => "Requested subscription plan does not exist."]);
        exit;
    }

    // 1. Update tenant's plan
    $stmt = $pdo->prepare("UPDATE tenants SET plan_id = ? WHERE id = ?");
    $stmt->execute([$planId, $tenantId]);

    echo json_encode(["message" => "Successfully upgraded to plan: " . $plan['name']]);
} catch (Exception $e) {
    error_log("Upgrade API Error for tenant " . ($tenantId ?? 'unknown') . ": " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to upgrade subscription plan: " . $e->getMessage()]);
}
?>
