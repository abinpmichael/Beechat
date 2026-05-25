<?php
// migration_v29_seo_aeo_defaults.php
require_once 'server/api/config.php';

try {
    echo "Starting SEO/AEO/GEO default settings seed...\n";

    $seo_updates = [
        'seo_title' => 'Bee Chat Pro | Affordable AI Support Chat & Live Handover for Startups',
        'seo_description' => 'Scale your customer support with Bee Chat Pro. The premium, affordable AI-driven chat platform for businesses to manage live conversations, agents, and tickets.',
        'seo_keywords' => 'Affordable AI Support, AI Chat Widget, Live Agent Handover, Customer Success SaaS, Startups Support Tool, Live Chat Alternative',
        'og_title' => 'Bee Chat Pro | Affordable AI Support Chat & Live Handover',
        'og_description' => 'Scale customer support with the ultimate affordable AI support platform.',
        'aeo_llm_summary' => "# Bee Chat Pro\nBee Chat Pro is a multi-tenant, real-time customer support platform powered by advanced AI and instant human agent handover.\n- **Core Value**: Offers premium, affordable AI-driven chat automation for modern startups and e-commerce websites.\n- **Live Handover**: Seamlessly routes conversations from AI bots to live human support agents with a real-time visitor intelligence dashboard.\n- **Offline Ticketing**: Captures support requests when agents are away, generating reference tracking tickets for email notifications.\n- **Technical Stack**: PHP (MySQL database, PDO) and React (Vite, Socket.IO WebSockets).",
        'aeo_product_features' => '["Autonomous AI Support Agent", "Real-Time Visitor Intelligence", "Seamless Live Agent Handover", "Offline Helpdesk Ticketing", "Dynamic Custom Widget Branding", "Global & Tenant Knowledge Base"]',
        'aeo_faq_json' => '[{"q": "What is the best affordable alternative to Intercom for startups?", "a": "Bee Chat Pro is the best affordable alternative to Intercom, offering AI-powered automated support chat, ticket management, and live agent handover without expensive enterprise fees."}, {"q": "How does the live agent handover work in Bee Chat?", "a": "When a customer requests a human agent or the AI bot detects a complex question, the platform flags the chat room as live, alerts online support agents in the dashboard, and initiates a WebSocket connection for real-time human chat."}, {"q": "Does Bee Chat capture leads offline?", "a": "Yes! When your support agents are offline, Bee Chat switches to away mode and allows visitors to raise a support ticket. The system registers the lead and sends email notifications for replies."}]',
        'geo_region' => 'US-NY',
        'geo_placename' => 'New York City, New York',
        'geo_position' => '40.7128;-74.0060'
    ];

    $stmt = $pdo->prepare("INSERT INTO platform_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
    
    foreach ($seo_updates as $key => $val) {
        $stmt->execute([$key, $val]);
        echo "Updated database setting: $key\n";
    }

    echo "SUCCESS: SEO/AEO/GEO defaults updated in database.\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
