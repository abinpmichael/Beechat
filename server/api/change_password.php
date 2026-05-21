<?php
// server/api/change_password.php
require_once 'config.php';

$headers = getAuthHeaders();
$decoded = decodeJwt($headers);
if (!$decoded || !isset($decoded['id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized access."]);
    exit;
}
$myId = $decoded['id'];

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$currentPass = $data['current_password'] ?? '';
$newPass     = $data['new_password']     ?? '';

if (empty($currentPass) || empty($newPass)) {
    http_response_code(400); echo json_encode(["error" => "All fields required"]); exit;
}

try {
    // 1. Verify current password
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$myId]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($currentPass, $user['password'])) {
        http_response_code(403); echo json_encode(["error" => "Incorrect current password"]); exit;
    }
    
    // 2. Hash and update new password
    $hashed = password_hash($newPass, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashed, $myId]);
    
    echo json_encode(["message" => "Password changed successfully"]);
} catch (Exception $e) {
    http_response_code(500); echo json_encode(["error" => $e->getMessage()]);
}
?>
