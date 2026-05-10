<?php
require_once 'server/api/config.php';

$email = 'admin@beechat.com';
$password = 'admin123';
$hashed = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("UPDATE users SET password = ?, is_superadmin = 1 WHERE email = ?");
    $stmt->execute([$hashed, $email]);
    echo "SUCCESS: Super Admin account updated.\nEmail: $email\nPassword: $password";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
