<?php
// server/api/super_users.php
require_once 'config.php';

$headers = getallheaders();
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

    $action = $_GET['action'] ?? 'list';

    if ($action === 'toggle_superadmin') {
        $data = json_decode(file_get_contents("php://input"), true);
        $userId = $data['id'];
        $newStatus = $data['is_superadmin'] ? 1 : 0;
        
        // Prevent self-demotion
        if ($userId == $tokenData['id']) {
            http_response_code(400);
            echo json_encode(["error" => "You cannot demote yourself!"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE users SET is_superadmin = ? WHERE id = ?");
        $stmt->execute([$newStatus, $userId]);
        echo json_encode(["success" => true]);
    } else {
        $stmt = $pdo->query("SELECT u.id, u.name, u.email, u.role, u.is_superadmin, t.name as tenant_name FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id ORDER BY u.is_superadmin DESC, u.created_at DESC");
        $users = $stmt->fetchAll();
        echo json_encode($users);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
