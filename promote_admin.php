<?php
require_once 'server/api/config.php';
$email = 'admin@beechat.com';
$pdo->prepare("UPDATE users SET is_superadmin = 1, role = 'superadmin' WHERE email = ?")->execute([$email]);
echo "SUCCESS: admin@beechat.com is now a verified SuperAdmin.";
?>
