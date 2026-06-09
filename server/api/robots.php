<?php
require_once 'config.php';
header("Content-Type: text/plain; charset=utf-8");

$stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'seo_canonical_url'");
$stmt->execute();
$canonical = $stmt->fetchColumn() ?: "https://www.beechat.online/";
$domain = rtrim($canonical, '/');

echo "User-agent: *\n";
echo "Disallow: /server/\n";
echo "Disallow: /tests/\n";
echo "Disallow: /dashboard/\n";
echo "Disallow: /widget/\n";
echo "Allow: /\n\n";

// Block AI crawlers and training bots
$ai_bots = ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Google-Extended', 'PerplexityBot'];
foreach ($ai_bots as $bot) {
    echo "User-agent: " . $bot . "\n";
    echo "Disallow: /\n\n";
}

echo "Sitemap: " . $domain . "/sitemap.xml\n";
?>
