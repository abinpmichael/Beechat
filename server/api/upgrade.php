<?php
// server/api/upgrade.php
require_once 'config.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $m)) {
    http_response_code(401); exit;
}

try {
    $decoded = json_decode(base64_decode($m[1]), true);
    $tenantId = $decoded['tenant_id'];

    $data = json_decode(file_get_contents("php://input"), true);
    $planId = (int)($data['plan_id'] ?? 0);

    if ($planId <= 0) {
        http_response_code(400); echo json_encode(["error" => "Invalid plan ID"]); exit;
    }

    // 1. Update tenant's plan
    $stmt = $pdo->prepare("UPDATE tenants SET plan_id = ? WHERE id = ?");
    $stmt->execute([$planId, $tenantId]);

    echo json_encode(["message" => "Successfully upgraded!"]);
} catch (Exception $e) {
    http_response_code(500); echo json_encode(["error" => $e->getMessage()]);
}
