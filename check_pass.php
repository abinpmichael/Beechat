<?php
require_once 'server/api/config.php';
$stmt = $pdo->prepare("SELECT email, password, role FROM users WHERE email = 'admin@cognitioit.ca'");
$stmt->execute();
$user = $stmt->fetch();
if ($user) {
    echo "User found. Role: " . $user['role'] . "\n";
    echo "Hash: " . $user['password'] . "\n";
    echo "Password123 matches: " . (password_verify('password123', $user['password']) ? 'YES' : 'NO') . "\n";
} else {
    echo "User not found\n";
}
?>
