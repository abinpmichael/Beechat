<?php
// server/api/settings.php
require_once 'config.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$headers = getAuthHeaders();
$auth = decodeJwt($headers);

/* ── PUBLIC SETTINGS (No Auth) ────────────────────────────── */
if ($method === 'GET' && !$auth) {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings WHERE setting_key NOT IN (
        'stripe_secret_key', 'stripe_webhook_secret', 'openai_api_key', 'smtp_pass', 'smtp_user'
    )");
    $settings = [];
    foreach ($stmt->fetchAll() as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    // Support & Contact Defaults
    if (!isset($settings['support_email'])) $settings['support_email'] = 'support@beechat.com';
    if (!isset($settings['support_phone'])) $settings['support_phone'] = '';
    if (!isset($settings['support_whatsapp'])) $settings['support_whatsapp'] = '';
    if (!isset($settings['help_center_url'])) $settings['help_center_url'] = '';
    if (!isset($settings['tutorial_video_url'])) $settings['tutorial_video_url'] = '/tutorial.webp';

    // SEO, AEO, GEO Defaults
    if (!isset($settings['platform_name'])) $settings['platform_name'] = 'Bee Chat';
    if (!isset($settings['google_client_id'])) $settings['google_client_id'] = '';
    if (!isset($settings['seo_title'])) $settings['seo_title'] = 'Bee Chat | AI-Powered Customer Support Platform';
    if (!isset($settings['seo_description'])) $settings['seo_description'] = 'Manage your customer support like a colony. Fast, intelligent, and real-time AI-powered chat for modern businesses.';
    if (!isset($settings['seo_keywords'])) $settings['seo_keywords'] = 'AI Chat, Live Support, Customer Engagement, SaaS Chat, Real-time Messaging';
    if (!isset($settings['seo_canonical_url'])) $settings['seo_canonical_url'] = 'https://www.beechat.online/';
    if (!isset($settings['seo_author'])) $settings['seo_author'] = 'Bee Chat Team';
    if (!isset($settings['seo_robots'])) $settings['seo_robots'] = 'index, follow';
    if (!isset($settings['og_title'])) $settings['og_title'] = 'Bee Chat | The Ultimate AI Chat Platform';
    if (!isset($settings['og_description'])) $settings['og_description'] = 'Fast, intelligent, and real-time AI-powered chat for modern businesses.';
    if (!isset($settings['og_image'])) $settings['og_image'] = '/og-image.png';
    if (!isset($settings['twitter_handle'])) $settings['twitter_handle'] = '@BeeChatAI';
    if (!isset($settings['aeo_llm_summary'])) $settings['aeo_llm_summary'] = '# Bee Chat AI Overview\nBee Chat is an enterprise-grade AI customer support platform combining real-time human agent handovers with autonomous AI support bots trained on tenant-specific knowledge bases.';
    if (!isset($settings['aeo_product_features'])) $settings['aeo_product_features'] = '["Autonomous AI Support Bot", "Live Agent Handover", "Multi-Tenant Architecture", "Real-Time Visitor Intelligence", "Automated Helpdesk Ticketing", "Global & Tenant Knowledge Base"]';
    if (!isset($settings['aeo_faq_json'])) $settings['aeo_faq_json'] = '[{"q":"What is Bee Chat?","a":"Bee Chat is an advanced customer support platform with AI auto-replies and real-time agent handover."},{"q":"How does the AI Bot work?","a":"The AI bot learns from your website and custom documents to provide instant accurate answers 24/7."}]';
    if (!isset($settings['geo_region'])) $settings['geo_region'] = 'US-CA';
    if (!isset($settings['geo_placename'])) $settings['geo_placename'] = 'San Francisco, California';
    if (!isset($settings['geo_position'])) $settings['geo_position'] = '37.7749;-122.4194';
    if (!isset($settings['geo_target_country'])) $settings['geo_target_country'] = 'Global';
    if (!isset($settings['gtm_id'])) $settings['gtm_id'] = '';

    echo json_encode($settings);
    exit;
}

/* ── TENANT SETTINGS (Requires Auth) ───────────────────────── */
if (!$auth) {
    http_response_code(401);
    exit(json_encode(["error" => "Unauthorized"]));
}

$tenantId = $auth['tenant_id'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM tenant_settings WHERE tenant_id = ?");
    $stmt->execute([$tenantId]);
    $res = $stmt->fetch();
    
    if (!$res) {
        // Create default settings if missing
        $pdo->prepare("INSERT INTO tenant_settings (tenant_id) VALUES (?)")->execute([$tenantId]);
        $stmt->execute([$tenantId]);
        $res = $stmt->fetch();
    }
    
    echo json_encode($res);
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    
    // Whitelist allowed fields
    $allowedFields = [
        'handover_enabled', 'visitor_tracking', 'default_language', 
        'opening_time', 'closing_time', 'chat_visibility', 'ai_auto_reply', 
        'ai_offline_only', 'notifications_enabled', 'default_theme_color', 
        'default_bot_name', 'timezone'
    ];
    
    $updates = [];
    $params = [];
    foreach ($data as $key => $val) {
        if (in_array($key, $allowedFields)) {
            $updates[] = "$key = ?";
            $params[] = $val;
        }
    }
    
    if (empty($updates)) exit(json_encode(["status" => "no-changes"]));
    
    $params[] = $tenantId;
    $sql = "UPDATE tenant_settings SET " . implode(", ", $updates) . " WHERE tenant_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    echo json_encode(["status" => "ok", "updated" => count($updates)]);
}
?>
