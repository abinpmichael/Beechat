<?php
require_once 'server/api/config.php';
$stmt = $pdo->query("DESCRIBE tenant_settings");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
