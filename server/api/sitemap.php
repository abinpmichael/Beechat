<?php
require_once 'config.php';
header("Content-Type: application/xml; charset=utf-8");

$stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'seo_canonical_url'");
$stmt->execute();
$canonical = $stmt->fetchColumn() ?: "https://www.beechat.online/";
$domain = rtrim($canonical, '/');

// Static pages use the date of the last deploy (index.html build time), not "today".
$build_file = __DIR__ . '/../../index.html';
$static_lastmod = file_exists($build_file) ? date('Y-m-d', filemtime($build_file)) : null;

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// Public, indexable pages only (login/register are noindex and left out).
$pages = [
    ''              => ['1.0', 'weekly'],
    '/live-chat-widget' => ['0.9', 'monthly'],
    '/integrations' => ['0.8', 'monthly'],
    '/help'         => ['0.7', 'monthly'],
    '/blog'         => ['0.8', 'weekly'],
    '/privacy'      => ['0.3', 'yearly'],
    '/terms'        => ['0.3', 'yearly']
];

foreach ($pages as $path => $meta) {
    $url = $path === '' ? $domain . '/' : $domain . $path;
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($url) . "</loc>\n";
    if ($static_lastmod) {
        echo "    <lastmod>" . $static_lastmod . "</lastmod>\n";
    }
    echo "    <changefreq>" . $meta[1] . "</changefreq>\n";
    echo "    <priority>" . $meta[0] . "</priority>\n";
    echo "  </url>\n";
}

// Fetch published blog posts (lastmod = publish date, matching the date shown on the post)
try {
    $stmt = $pdo->query("SELECT slug, COALESCE(published_at, created_at) AS lastmod_val FROM blog_posts WHERE status = 'published' AND (published_at IS NULL OR published_at <= NOW()) ORDER BY COALESCE(published_at, created_at) DESC");
} catch (Exception $e) {
    $stmt = null;
}
if ($stmt) {
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $post) {
        $lastmod = date('Y-m-d', strtotime($post['lastmod_val']));
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($domain . "/blog/" . $post['slug']) . "</loc>\n";
        echo "    <lastmod>" . $lastmod . "</lastmod>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.6</priority>\n";
        echo "  </url>\n";
    }
}

echo "</urlset>\n";
?>
