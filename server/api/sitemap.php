<?php
require_once 'config.php';
header("Content-Type: application/xml; charset=utf-8");

$stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'seo_canonical_url'");
$stmt->execute();
$canonical = $stmt->fetchColumn() ?: "https://www.beechat.online/";
$domain = rtrim($canonical, '/');

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

$pages = [
    '' => '1.0',
    '/login' => '0.8',
    '/register' => '0.8',
    '/dashboard' => '0.8'
];

foreach ($pages as $path => $priority) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($domain . $path) . "</loc>\n";
    echo "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
    echo "    <changefreq>daily</changefreq>\n";
    echo "    <priority>$priority</priority>\n";
    echo "  </url>\n";
}

echo "</urlset>\n";
?>
