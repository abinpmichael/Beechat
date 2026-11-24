<?php
require_once 'config.php';
header("Content-Type: text/plain; charset=utf-8");

$stmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN ('platform_name', 'seo_title', 'seo_description', 'seo_canonical_url', 'support_email', 'aeo_llm_summary', 'aeo_product_features', 'aeo_faq_json')");
$settings = [];
foreach ($stmt->fetchAll() as $row) {
    $settings[$row['setting_key']] = $row['setting_value'];
}

$name   = $settings['platform_name'] ?? 'BeeChat';
$domain = rtrim($settings['seo_canonical_url'] ?? 'https://www.beechat.online/', '/');
$email  = $settings['support_email'] ?? 'info@beechat.online';

// Stored summaries sometimes contain a literal "\n" instead of a line break.
$normalize = function ($s) {
    return str_replace(['\r\n', '\n'], "\n", (string)$s);
};

$summary = trim($normalize($settings['aeo_llm_summary'] ?? ''));
if ($summary === '') {
    $summary = "# " . $name . "\n\n> " . $name . " (" . preg_replace('#^https?://#', '', $domain) . ") is an AI chatbot and live chat widget for websites. "
        . "It answers visitor questions from the business's own documents and web pages, and hands conversations to human agents when needed.";
}
echo $summary . "\n\n";

echo "## Features\n";
$feats = json_decode($settings['aeo_product_features'] ?? '', true);
if (!is_array($feats) || count($feats) === 0) {
    $feats = [
        "AI chatbot trained on your own PDFs, Word documents, web pages and text",
        "Live chat with human agent takeover",
        "Lead capture and chat history",
        "Helpdesk tickets",
        "Manage multiple websites from one dashboard",
        "One-line JavaScript install (WordPress, Shopify, WooCommerce, any HTML site)"
    ];
}
foreach ($feats as $f) {
    echo "- " . $normalize($f) . "\n";
}

// Pricing straight from the plans table so it never goes stale.
try {
    $plans = $pdo->query("SELECT name, price, max_websites, max_chats_per_month, ai_enabled FROM plans ORDER BY price ASC")->fetchAll(PDO::FETCH_ASSOC);
    if ($plans) {
        echo "\n## Pricing (USD per month)\n";
        foreach ($plans as $p) {
            $sites = ((int)$p['max_websites'] >= 999) ? 'unlimited websites' : ((int)$p['max_websites'] . ((int)$p['max_websites'] === 1 ? ' website' : ' websites'));
            $ai    = $p['ai_enabled'] ? (((int)$p['max_chats_per_month'] > 0) ? ((int)$p['max_chats_per_month'] . ' AI conversations a month') : 'unlimited AI conversations') : 'live chat only, no AI replies';
            echo "- " . $p['name'] . ": $" . rtrim(rtrim(number_format((float)$p['price'], 2, '.', ''), '0'), '.') . " – " . $sites . ", " . $ai . "\n";
        }
    }
} catch (Exception $e) {
    // plans table unavailable — skip pricing section
}

echo "\n## Key pages\n";
echo "- [Home](" . $domain . "/): what " . $name . " is and how it works\n";
echo "- [Live chat widget](" . $domain . "/live-chat-widget): free live chat widget for any website, setup steps and pricing\n";
echo "- [Integrations](" . $domain . "/integrations): supported platforms, CRMs and messaging apps\n";
echo "- [Help center](" . $domain . "/help): setup, AI training and widget guides\n";
echo "- [Blog](" . $domain . "/blog): guides on AI chatbots and live chat support\n";

echo "\n## Frequently Asked Questions\n";
$faqs = json_decode($settings['aeo_faq_json'] ?? '', true);
if (!is_array($faqs) || count($faqs) === 0) {
    $faqs = [
        ["q" => "What is " . $name . "?", "a" => $name . " is an AI chatbot and live chat widget for websites. It answers visitor questions from your own content and lets your team take over any conversation."],
        ["q" => "How does the AI learn about my business?", "a" => "You upload PDFs or Word files, add page URLs or paste text in the dashboard, and the AI answers from that content."]
    ];
}
foreach ($faqs as $faq) {
    if (empty($faq['q']) || empty($faq['a'])) continue;
    echo "### " . $normalize($faq['q']) . "\n" . $normalize($faq['a']) . "\n\n";
}

echo "## Contact\n";
echo "- Email: " . $email . "\n";
?>
