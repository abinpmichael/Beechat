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
    if (!isset($settings['platform_contact_widget_api_key'])) $settings['platform_contact_widget_api_key'] = '';

    if (!isset($settings['privacy_policy'])) {
        $settings['privacy_policy'] = '<h2><strong>1. Introduction</strong></h2>' .
            '<p>Welcome to Bee Chat. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our platform and use our AI-powered customer support services.</p>' .
            '<h2><strong>2. Data We Collect</strong></h2>' .
            '<p>We may collect and process the following categories of data:</p>' .
            '<ul>' .
            '<li><strong>Account Information:</strong> Name, email address, password, and billing details when you register as a tenant.</li>' .
            '<li><strong>Visitor Data:</strong> IP addresses, browser types, and activity logs of visitors interacting with our chat widget.</li>' .
            '<li><strong>Conversation Logs:</strong> Transcripts of chat conversations between visitors, AI bots, and live agents for training and service improvement.</li>' .
            '</ul>' .
            '<h2><strong>3. How We Use Your Data</strong></h2>' .
            '<p>Your data is used to provide, maintain, and optimize our services. Specifically for:</p>' .
            '<ul>' .
            '<li>Initializing and personalizing AI-driven chat responses.</li>' .
            '<li>Processing payments and managing tenant subscriptions.</li>' .
            '<li>Analyzing platform performance and debugging system issues.</li>' .
            '</ul>' .
            '<h2><strong>4. Data Security</strong></h2>' .
            '<p>We implement industry-standard encryption and security measures to prevent unauthorized access, alteration, or disclosure of your personal data.</p>' .
            '<h2><strong>5. Contact Us</strong></h2>' .
            '<p>If you have any questions about this Privacy Policy, please contact us at our official support email.</p>';
    }

    if (!isset($settings['terms_of_service'])) {
        $settings['terms_of_service'] = '<h2><strong>1. Acceptance of Terms</strong></h2>' .
            '<p>By registering for or using Bee Chat services, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not use our platform.</p>' .
            '<h2><strong>2. Account Responsibilities</strong></h2>' .
            '<p>As a tenant, you are responsible for maintaining the confidentiality of your account credentials. You are fully responsible for all activities that occur under your account and chat widget.</p>' .
            '<h2><strong>3. Acceptable Use</strong></h2>' .
            '<p>You agree not to use our chat widget or platform to:</p>' .
            '<ul>' .
            '<li>Transmit any unlawful, threatening, abusive, or obscene content.</li>' .
            '<li>Impersonate any person or entity or misrepresent your affiliation.</li>' .
            '<li>Distribute viruses, malware, or any disruptive software.</li>' .
            '</ul>' .
            '<h2><strong>4. Limitation of Liability</strong></h2>' .
            '<p>Bee Chat shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.</p>' .
            '<h2><strong>5. Changes to Terms</strong></h2>' .
            '<p>We reserve the right to modify these Terms of Service at any time. Your continued use of the platform after changes are posted constitutes acceptance of the new terms.</p>';
    }

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
    if (!isset($settings['google_analytics_id'])) $settings['google_analytics_id'] = '';

    echo json_encode($settings);
    exit;
}

/* ── TENANT SETTINGS (Requires Auth) ───────────────────────── */
if (!$auth) {
    http_response_code(401);
    exit(json_encode(["error" => "Unauthorized"]));
}

$tenantId = $auth['tenant_id'];

// Dynamic column check to ensure tenant_settings schema matches code expectations
try {
    $cols = $pdo->query("SHOW COLUMNS FROM tenant_settings LIKE 'support_email'")->fetchAll();
    if (empty($cols)) {
        $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN support_email VARCHAR(255) DEFAULT NULL");
    }
} catch (Exception $schemaEx) {
    error_log("tenant_settings schema check failed: " . $schemaEx->getMessage());
}

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
        'default_bot_name', 'timezone', 'support_email'
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
