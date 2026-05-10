<?php
// server/api/super_stats.php
require_once 'config.php';

// Simple super-admin check (can be expanded)
$headers = getallheaders();
$auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if (empty($auth) || !preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
    http_response_code(401); exit;
}
$decoded = json_decode(base64_decode($m[1]), true);
// In a real app, check role or specific ID from DB
// For now, if role is 'admin', we can let them see (if they are the master admin)
// But let's assume super admin has a specific role 'super_admin' or email

try {
    $tenants = $pdo->query("SELECT COUNT(*) FROM tenants")->fetchColumn();
    $users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $websites = $pdo->query("SELECT COUNT(*) FROM websites")->fetchColumn();
    $messages = $pdo->query("SELECT COUNT(*) FROM messages")->fetchColumn();

    echo json_encode([
        "tenants" => (int)$tenants,
        "users" => (int)$users,
        "websites" => (int)$websites,
        "messages" => (int)$messages
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
