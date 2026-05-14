<?php
require_once 'server/api/config.php';
$password = password_hash('password123', PASSWORD_DEFAULT);
$pdo->exec("UPDATE users SET is_superadmin = 1, password = '$password' WHERE email = 'admin@cognitioit.ca'");
echo "Superadmin updated.";
?>
