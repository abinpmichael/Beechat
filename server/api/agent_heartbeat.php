<?php
// server/api/agent_heartbeat.php
require_once 'config.php';

$headers = getAuthHeaders();
$auth = decodeJwt($headers);

if (!$auth) {
    http_response_code(401);
    exit(json_encode(["error" => "Unauthorized"]));
}

$userId = $auth['id'];

try {
    $stmt = $pdo->prepare("UPDATE users SET last_seen_at = NOW() WHERE id = ?");
    $stmt->execute([$userId]);
    echo json_encode(["status" => "ok", "ts" => date('Y-m-d H:i:s')]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
