<?php
require_once 'server/api/config.php';
$stmt = $pdo->query("DESCRIBE tenants");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
