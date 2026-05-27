<?php
require 'server/api/config.php';

$s = $pdo->query("SELECT setting_value FROM platform_settings WHERE setting_key='openai_api_key'");
$k = $s->fetchColumn();
echo "OpenAI key: " . ($k ? substr($k,0,15).'...' : 'NOT SET') . "\n";

$s2 = $pdo->query("SELECT setting_value FROM platform_settings WHERE setting_key='enable_ai_bot'");
$g = $s2->fetchColumn();
echo "Global AI enabled: " . var_export($g, true) . "\n";

$s3 = $pdo->query("SELECT id, domain, ai_enabled FROM websites WHERE deleted_at IS NULL");
echo "Websites:\n";
foreach($s3->fetchAll() as $r) {
    echo "  id={$r['id']} domain={$r['domain']} ai_enabled={$r['ai_enabled']}\n";
}

$s4 = $pdo->query("SELECT tenant_id, ai_auto_reply, ai_offline_only FROM tenant_settings");
echo "Tenant settings:\n";
foreach($s4->fetchAll() as $r) {
    echo "  tenant={$r['tenant_id']} ai_auto_reply={$r['ai_auto_reply']} ai_offline_only={$r['ai_offline_only']}\n";
}
