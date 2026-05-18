<?php
// server/api/me.php
require_once 'config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$headers = getAuthHeaders();
$decoded = decodeJwt($headers);

if (!$decoded || !isset($decoded['id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized: Invalid or missing token"]);
    exit;
}

$userId = $decoded['id'];

try {
    $stmt = $pdo->prepare("
        SELECT u.id, u.name, u.email, u.role, u.tenant_id, u.is_superadmin,
               t.status as tenant_status, t.is_active, p.name as plan_name, p.max_websites, p.max_agents, p.ai_enabled
        FROM users u 
        JOIN tenants t ON u.tenant_id = t.id
        LEFT JOIN plans p ON t.plan_id = p.id
        WHERE u.id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
        exit;
    }

    if (isset($user['is_active']) && (int)$user['is_active'] === 0 && (int)$user['is_superadmin'] === 0) {
        http_response_code(403);
        echo json_encode(["message" => "Account suspended. Please contact support or renew subscription."]);
        exit;
    }

    $isSuper = (int)$user['is_superadmin'];

    echo json_encode([
        "id" => (int)$user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "role" => $user['role'],
        "tenant_id" => (int)$user['tenant_id'],
        "is_superadmin" => $isSuper,
        "plan" => [
            "name" => $isSuper ? 'Platform Owner' : ($user['plan_name'] ?? 'Free Tier'),
            "max_websites" => $isSuper ? 9999 : (int)($user['max_websites'] ?? 1),
            "max_agents" => $isSuper ? 9999 : (int)($user['max_agents'] ?? 2),
            "ai_enabled" => $isSuper ? true : (bool)$user['ai_enabled'],
            "expires_at" => $user['expires_at'] ?? null
        ],
        "status" => $user['tenant_status']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching user", "error" => $e->getMessage()]);
}
?>
