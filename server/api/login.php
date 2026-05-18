<?php
// server/api/login.php
require_once 'config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["message" => "No data provided"]);
    exit;
}

$email = $data['email'] ?? '';
$passwordRaw = $data['password'] ?? '';

if (empty($email) || empty($passwordRaw)) {
    http_response_code(400);
    echo json_encode(["message" => "Email and password are required"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT u.*, t.slug as tenant_slug, t.is_active FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($passwordRaw, $user['password'])) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid credentials"]);
        exit;
    }

    if (isset($user['is_active']) && (int)$user['is_active'] === 0 && (int)$user['is_superadmin'] === 0) {
        http_response_code(403);
        echo json_encode(["message" => "Account suspended. Please contact support or renew subscription."]);
        exit;
    }

    // Simple token (in production use JWT)
    $token = base64_encode(json_encode([
        'id' => $user['id'], 
        'tenant_id' => $user['tenant_id'], 
        'role' => $user['role'],
        'is_superadmin' => (int)$user['is_superadmin']
    ]));

    echo json_encode([
        "message" => "Login successful",
        "user" => [
            "id" => (int)$user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role'],
            "tenant_id" => (int)$user['tenant_id'],
            "tenant_slug" => $user['tenant_slug'],
            "is_superadmin" => (int)$user['is_superadmin']
        ],
        "token" => $token
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error logging in", "error" => $e->getMessage()]);
}
?>
