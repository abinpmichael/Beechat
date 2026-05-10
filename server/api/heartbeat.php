<?php
// server/api/heartbeat.php
// Called by the widget every 20s to prove the visitor is still online.
// If no heartbeat for 60s, the lead is considered offline by the dashboard.
require_once 'config.php';

$data      = json_decode(file_get_contents("php://input"), true) ?? [];
$sessionId = $data['sessionId'] ?? $_GET['sessionId'] ?? '';
$apiKey    = $data['apiKey']    ?? $_GET['apiKey']    ?? '';

if (empty($sessionId) || empty($apiKey)) {
    http_response_code(400);
    echo json_encode(["error" => "sessionId and apiKey required"]);
    exit;
}

try {
    // Update last_seen_at for matching lead
    $stmt = $pdo->prepare("
        UPDATE leads l
        JOIN websites w ON l.website_id = w.id
        SET l.last_seen_at = NOW()
        WHERE l.session_id = ?
          AND w.api_key    = ?
          AND l.is_live    = 1
    ");
    $stmt->execute([$sessionId, $apiKey]);

    echo json_encode(["status" => "ok", "ts" => date('Y-m-d H:i:s')]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
