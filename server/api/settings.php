<?php
// server/api/settings.php
require_once 'config.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$headers = getAuthHeaders();
$auth = decodeJwt($headers);

/* ── PUBLIC SETTINGS (No Auth) ────────────────────────────── */
if ($method === 'GET' && !$auth) {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN (
        'platform_name', 'google_client_id', 'seo_title', 'seo_description', 'seo_keywords', 'gtm_id', 
        'enable_registration', 'enable_ai_bot', 'enable_live_chat', 'enable_ticketing', 'enable_billing', 
        'landing_page_active', 'support_email', 'support_phone', 'support_whatsapp', 'help_center_url'
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

    // Defaults
    if (!isset($settings['platform_name'])) $settings['platform_name'] = 'Bee Chat';
    if (!isset($settings['google_client_id'])) $settings['google_client_id'] = '';
    if (!isset($settings['seo_title'])) $settings['seo_title'] = 'Bee Chat | AI-Powered Support';
    if (!isset($settings['seo_description'])) $settings['seo_description'] = '';
    if (!isset($settings['seo_keywords'])) $settings['seo_keywords'] = '';
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
