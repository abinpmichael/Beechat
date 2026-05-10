<?php
require_once 'server/api/config.php';
$stmt = $pdo->query("SELECT id, name, email, role, is_superadmin FROM users");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
