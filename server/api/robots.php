<?php
require_once 'config.php';
header("Content-Type: text/plain; charset=utf-8");

$stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'seo_canonical_url'");
$stmt->execute();
$canonical = $stmt->fetchColumn() ?: "https://www.beechat.online/";
$domain = rtrim($canonical, '/');

$private_paths = ['/server/', '/tests/', '/dashboard/', '/widget/'];

echo "User-agent: *\n";
foreach ($private_paths as $p) {
    echo "Disallow: " . $p . "\n";
}
echo "Allow: /\n\n";

// AI search & answer engines are explicitly ALLOWED on public pages so BeeChat
// can be found and cited by ChatGPT, Claude, Perplexity, Gemini and Apple.
// To opt out of AI *training* only, move GPTBot, ClaudeBot, Google-Extended and
// Applebot-Extended into a separate group with "Disallow: /".
$ai_bots = [
    'OAI-SearchBot', 'ChatGPT-User', 'GPTBot',
    'Claude-SearchBot', 'Claude-User', 'ClaudeBot',
    'PerplexityBot', 'Perplexity-User',
    'Google-Extended', 'Applebot-Extended'
];
foreach ($ai_bots as $bot) {
    echo "User-agent: " . $bot . "\n";
}
foreach ($private_paths as $p) {
    echo "Disallow: " . $p . "\n";
}
echo "Allow: /\n\n";

echo "Sitemap: " . $domain . "/sitemap.xml\n";
?>
