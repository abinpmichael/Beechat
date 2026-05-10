<?php
require_once 'server/api/config.php';
// Remove SuperAdmin from others
$pdo->exec("UPDATE users SET is_superadmin = 0 WHERE email != 'admin@beechat.com'");
// Ensure admin@beechat.com IS SuperAdmin
$pdo->exec("UPDATE users SET is_superadmin = 1, role = 'superadmin' WHERE email = 'admin@beechat.com'");

echo "SUCCESS: admin@beechat.com is now the ONLY SuperAdmin.";
?>
