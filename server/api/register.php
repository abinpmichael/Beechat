<?php
// server/api/register.php
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

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$passwordRaw = $data['password'] ?? '';
$companyName = $data['companyName'] ?? '';

if (empty($name) || empty($email) || empty($passwordRaw) || empty($companyName)) {
    http_response_code(400);
    echo json_encode(["message" => "All fields are required"]);
    exit;
}

$password = password_hash($passwordRaw, PASSWORD_DEFAULT);

try {
    $pdo->beginTransaction();

    // 1. Create Tenant (Default to Free Tier, plan_id = 1)
    $stmt = $pdo->prepare("INSERT INTO tenants (name, slug, plan_id) VALUES (?, ?, 1)");
    $slug = strtolower(preg_replace('/[^a-z0-9]+/', '-', $companyName));
    $stmt->execute([$companyName, $slug]);
    $tenantId = $pdo->lastInsertId();

    // 2. Create User
    $stmt = $pdo->prepare("INSERT INTO users (tenant_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$tenantId, $name, $email, $password, 'admin']);
    $userId = $pdo->lastInsertId();

    // 3. Create Default Settings
    $stmt = $pdo->prepare("INSERT INTO tenant_settings (tenant_id) VALUES (?)");
    $stmt->execute([$tenantId]);

    $pdo->commit();

    // 4. Queue Welcome Email
    try {
        require_once 'mail_service.php';
        $mail = new MailService($pdo);
        $mail->queue($email, 'welcome_admin', [
            'name' => $name,
            'company' => $companyName,
            'login_url' => getFrontendBaseUrl() . '/login'
        ]);
    } catch (Exception $e) { /* Silent fail for email queueing in registration */ }

    // Simple token (in production use JWT)
    $token = base64_encode(json_encode([
        'id' => $userId, 
        'tenant_id' => $tenantId, 
        'role' => 'admin',
        'is_superadmin' => 0
    ]));

    echo json_encode([
        "message" => "Registration successful",
        "user" => [
            "id" => (int)$userId,
            "name" => $name,
            "email" => $email,
            "role" => "admin",
            "tenant_id" => (int)$tenantId
        ],
        "token" => $token
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["message" => "Error registering user", "error" => $e->getMessage()]);
}
?>
