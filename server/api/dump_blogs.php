<?php
require_once 'config.php';
$stmt = $pdo->query('SELECT id, title, slug, status, created_at, published_at FROM blog_posts');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
