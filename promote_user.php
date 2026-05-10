<?php
require_once 'server/api/config.php';
$email = 'abinp.michael@gmail.com';
$pdo->prepare("UPDATE users SET is_superadmin = 1 WHERE email = ?")->execute([$email]);
echo "SUCCESS: Promoted $email to SuperAdmin.";
?>
