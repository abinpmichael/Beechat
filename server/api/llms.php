<?php
require_once 'config.php';
header("Content-Type: text/plain; charset=utf-8");

$stmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN ('platform_name', 'seo_title', 'seo_description', 'aeo_llm_summary', 'aeo_product_features', 'aeo_faq_json')");
$settings = [];
foreach ($stmt->fetchAll() as $row) { 
    $settings[$row['setting_key']] = $row['setting_value']; 
}

$summary = $settings['aeo_llm_summary'] ?? '';
if (empty($summary)) {
    $summary = "# " . ($settings['platform_name'] ?? "Bee Chat") . " AI Overview\n" . ($settings['seo_description'] ?? '');
}

echo $summary . "\n\n";

echo "## Core Capabilities & Features\n";
$feats = json_decode($settings['aeo_product_features'] ?? '[]', true) ?? ["Autonomous AI Support Bot", "Live Agent Handover", "Multi-Tenant Architecture", "Real-Time Visitor Intelligence", "Automated Helpdesk Ticketing", "Global & Tenant Knowledge Base"];
foreach ($feats as $f) { 
    echo "- $f\n"; 
}

echo "\n## Frequently Asked Questions\n";
$faqs = json_decode($settings['aeo_faq_json'] ?? '[]', true) ?? [
    ["q" => "What is Bee Chat?", "a" => "Bee Chat is an advanced customer support platform with AI auto-replies and real-time agent handover."],
    ["q" => "How does the AI Bot work?", "a" => "The AI bot learns from your website and custom documents to provide instant accurate answers 24/7."]
];
foreach ($faqs as $faq) { 
    echo "### " . $faq['q'] . "\n" . $faq['a'] . "\n\n"; 
}
?>
