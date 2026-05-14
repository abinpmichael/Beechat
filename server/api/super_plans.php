<?php
// server/api/super_plans.php
require_once 'config.php';

$headers = getAuthHeaders();
$auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if (empty($auth) || !preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
    http_response_code(401); exit;
}

try {
    $tokenData = json_decode(base64_decode($m[1]), true);
    $check = $pdo->prepare("SELECT is_superadmin FROM users WHERE id = ?");
    $check->execute([$tokenData['id']]);
    $currentUser = $check->fetch();

    if (!$currentUser || $currentUser['is_superadmin'] != 1) {
        http_response_code(403); exit("Access Denied");
    }

    $stmt = $pdo->query("SELECT * FROM plans ORDER BY price ASC");
    $plans = $stmt->fetchAll();
    echo json_encode($plans);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
