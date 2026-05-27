<?php
require 'server/api/config.php';

// 1. Enable AI on ALL websites
$r1 = $pdo->exec("UPDATE websites SET ai_enabled = 1 WHERE ai_enabled = 0 OR ai_enabled IS NULL");
echo "Websites updated to ai_enabled=1: $r1\n";

// 2. Set ai_offline_only=0 for ALL tenants (AI works even when agents are online)
$r2 = $pdo->exec("UPDATE tenant_settings SET ai_offline_only = 0");
echo "Tenants updated ai_offline_only=0: $r2\n";

// 3. Enable ai_auto_reply for ALL tenants
$r3 = $pdo->exec("UPDATE tenant_settings SET ai_auto_reply = 1");
echo "Tenants updated ai_auto_reply=1: $r3\n";

// 4. Verify
$s = $pdo->query("SELECT id, domain, ai_enabled FROM websites WHERE deleted_at IS NULL");
echo "\nWebsites after fix:\n";
foreach($s->fetchAll() as $r) {
    echo "  id={$r['id']} domain={$r['domain']} ai_enabled={$r['ai_enabled']}\n";
}

$s2 = $pdo->query("SELECT tenant_id, ai_auto_reply, ai_offline_only FROM tenant_settings");
echo "\nTenant settings after fix:\n";
foreach($s2->fetchAll() as $r) {
    echo "  tenant={$r['tenant_id']} ai_auto_reply={$r['ai_auto_reply']} ai_offline_only={$r['ai_offline_only']}\n";
}

echo "\nDONE! AI should now work in widget.\n";
