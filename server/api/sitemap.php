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
    '/dashboard' => '0.8',
    '/help' => '0.7',
    '/privacy' => '0.5',
    '/terms' => '0.5',
    '/blog' => '0.8'
];

foreach ($pages as $path => $priority) {
    $url = $domain . $path;
    if ($path === '') {
        $url = $domain . '/';
    }
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($url) . "</loc>\n";
    echo "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
    echo "    <changefreq>daily</changefreq>\n";
    echo "    <priority>$priority</priority>\n";
    echo "  </url>\n";
}

// Fetch published blog posts
try {
    $stmt = $pdo->query("SELECT slug, COALESCE(published_at, created_at) AS lastmod_val FROM blog_posts WHERE status = 'published' AND (published_at IS NULL OR published_at <= NOW()) ORDER BY COALESCE(published_at, created_at) DESC");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($posts as $post) {
        $lastmod = date('Y-m-d', strtotime($post['lastmod_val']));
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($domain . "/blog/" . $post['slug']) . "</loc>\n";
        echo "    <lastmod>" . $lastmod . "</lastmod>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.7</priority>\n";
        echo "  </url>\n";
    }
} catch (Exception $e) {
    // Ignore database errors during sitemap generation
}

echo "</urlset>\n";
?>
