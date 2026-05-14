<?php
require_once 'server/api/config.php';
$email = 'testuser_new@example.com';
$password = password_hash('password123', PASSWORD_DEFAULT);
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
$stmt->execute([$password, $email]);
echo "Password updated for $email";
?>
