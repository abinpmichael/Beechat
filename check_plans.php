<?php
require_once 'server/api/config.php';
$stmt = $pdo->query("SELECT * FROM plans");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
