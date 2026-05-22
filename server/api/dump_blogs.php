<?php
require_once 'config.php';
header('Content-Type: application/json');
$stmt = $pdo->query('SELECT id, title, slug, status, created_at, published_at FROM blog_posts');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
