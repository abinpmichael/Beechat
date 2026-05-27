<?php
// server/api/fix_ai.php
// Run this ONCE to enable AI on all existing websites and ensure global AI toggle is on
// Visit: https://www.beechat.online/server/api/fix_ai.php
// DELETE this file after running!
require_once 'config.php';

header('Content-Type: application/json');

$results = [];

try {
    // 1. Enable global AI bot toggle
    $stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'enable_ai_bot'");
    $stmt->execute();
    $existing = $stmt->fetchColumn();
    
    if ($existing === false) {
        $pdo->prepare("INSERT INTO platform_settings (setting_key, setting_value) VALUES ('enable_ai_bot', '1')")->execute();
        $results['global_ai_bot'] = 'INSERTED as enabled (1)';
    } else {
        $pdo->prepare("UPDATE platform_settings SET setting_value = '1' WHERE setting_key = 'enable_ai_bot'")->execute();
        $results['global_ai_bot'] = "UPDATED from '$existing' to '1'";
    }

    // 2. Enable AI on ALL existing websites
    $stmt = $pdo->query("UPDATE websites SET ai_enabled = 1 WHERE ai_enabled = 0 OR ai_enabled IS NULL");
    $results['websites_ai_enabled'] = $stmt->rowCount() . ' websites updated to ai_enabled=1';

    // 3. Set ai_offline_only = 0 for all tenants (so AI works even when agents are online)
    $stmt = $pdo->query("UPDATE tenant_settings SET ai_offline_only = 0 WHERE ai_offline_only = 1 OR ai_offline_only IS NULL");
    $results['tenant_offline_only_reset'] = $stmt->rowCount() . ' tenants updated: ai_offline_only=0 (AI always active)';

    // 4. Verify current state
    $stmt = $pdo->query("SELECT COUNT(*) FROM websites WHERE ai_enabled = 1");
    $results['websites_with_ai_enabled'] = (int)$stmt->fetchColumn();

    $stmt = $pdo->query("SELECT setting_value FROM platform_settings WHERE setting_key = 'openai_api_key'");
    $key = $stmt->fetchColumn();
    $results['openai_key_configured'] = !empty($key) ? 'YES - ' . substr($key, 0, 10) . '...' : 'NO - Please add via SuperAdmin settings!';

    $results['status'] = 'SUCCESS - AI should now work in widget. DELETE this file after confirming!';

} catch (Exception $e) {
    $results['error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
