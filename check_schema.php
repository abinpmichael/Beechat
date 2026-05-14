<?php
$pdo = new PDO('mysql:host=localhost;dbname=bee_chat', 'root', '');
$stmt = $pdo->query('DESCRIBE platform_settings');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
