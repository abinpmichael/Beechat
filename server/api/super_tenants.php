<?php
// server/api/super_tenants.php
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

    if ($action === 'impersonate') {
        $tenantId = $_GET['tenantId'] ?? 0;
        // Find the first admin for this tenant
        $stmt = $pdo->prepare("SELECT id, tenant_id, role FROM users WHERE tenant_id = ? AND role = 'admin' LIMIT 1");
        $stmt->execute([$tenantId]);
        $targetUser = $stmt->fetch();

        if ($targetUser) {
            $newToken = base64_encode(json_encode(['id' => $targetUser['id'], 'tenant_id' => $targetUser['tenant_id'], 'role' => $targetUser['role']]));
            echo json_encode(["token" => $newToken]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "No admin user found for this tenant"]);
        }
    } elseif ($action === 'update_status') {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("UPDATE tenants SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['id']]);
        echo json_encode(["success" => true]);
    } elseif ($action === 'update_plan') {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("UPDATE tenants SET plan_id = ? WHERE id = ?");
        $stmt->execute([$data['plan_id'], $data['id']]);
        echo json_encode(["success" => true]);
    } else {
        $stmt = $pdo->query("
            SELECT t.*, p.name as plan_name 
            FROM tenants t 
            LEFT JOIN plans p ON t.plan_id = p.id 
            ORDER BY t.created_at DESC
        ");
        $tenants = $stmt->fetchAll();
        echo json_encode($tenants);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
