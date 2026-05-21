<?php
// server/api/super_settings.php
require_once 'config.php';

$headers = getAuthHeaders();
$decoded = decodeJwt($headers);
if (!$decoded || !isset($decoded['id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized access."]);
    exit;
}

try {
    $tokenData = $decoded;
    $check = $pdo->prepare("SELECT is_superadmin FROM users WHERE id = ?");
    $check->execute([$tokenData['id']]);
    $currentUser = $check->fetch();

    if (!$currentUser || $currentUser['is_superadmin'] != 1) {
        http_response_code(403); exit("Access Denied");
    }

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM system_settings");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        echo json_encode($settings);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        foreach ($data as $key => $value) {
            $stmt = $pdo->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            $stmt->execute([$key, $value, $value]);
        }
        echo json_encode(["success" => true]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
