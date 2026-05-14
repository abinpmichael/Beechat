<?php
// server/api/notifications.php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$auth = decodeJwt(getBearerToken());

if (!$auth) { http_response_code(401); exit(json_encode(["error"=>"Unauthorized"])); }
$tenantId = $auth['tenant_id'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 20");
        $stmt->execute([$tenantId]);
        echo json_encode($stmt->fetchAll());
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['action']) && $data['action'] === 'mark_read') {
            if (isset($data['id'])) {
                $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND tenant_id = ?")->execute([$data['id'], $tenantId]);
            } else {
                $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE tenant_id = ?")->execute([$tenantId]);
            }
            echo json_encode(["success" => true]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
