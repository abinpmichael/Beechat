<?php
// server/api/super_stats.php
require_once 'config.php';

$headers = getAuthHeaders();
$decoded = decodeJwt($headers);

if (!$decoded || !isset($decoded['id']) || !isset($decoded['is_superadmin']) || !(int)$decoded['is_superadmin']) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized access."]);
    exit;
}

try {
    $tenants = $pdo->query("SELECT COUNT(*) FROM tenants")->fetchColumn();
    $users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $websites = $pdo->query("SELECT COUNT(*) FROM websites")->fetchColumn();
    $messages = $pdo->query("SELECT COUNT(*) FROM messages")->fetchColumn();

    $mrr = $pdo->query("SELECT SUM(CASE WHEN billing_interval = 'monthly' THEN p.price ELSE p.price_annual / 12 END) FROM subscriptions s JOIN plans p ON s.plan_id = p.id WHERE s.status = 'active'")->fetchColumn() ?: 0;
    
    $arr = $mrr * 12;

    echo json_encode([
        "tenants" => (int)$tenants,
        "users" => (int)$users,
        "websites" => (int)$websites,
        "messages" => (int)$messages,
        "mrr" => (float)$mrr,
        "arr" => (float)$arr
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
