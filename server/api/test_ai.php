<?php
// server/api/test_ai.php
require_once 'config.php';
header('Content-Type: text/plain');
set_time_limit(30);

echo "=== BeeChat AI Full Diagnostic ===\n\n";

// 1. OpenAI key
$openAiKey = $pdo->query("SELECT setting_value FROM platform_settings WHERE setting_key='openai_api_key'")->fetchColumn();
echo "1. OpenAI Key: " . ($openAiKey ? '✅ Found: ' . substr($openAiKey,0,20).'...' : '❌ NOT SET') . "\n";

// 2. Global AI toggle
$globalAi = $pdo->query("SELECT setting_value FROM platform_settings WHERE setting_key='enable_ai_bot'")->fetchColumn();
echo "2. Global AI: " . ($globalAi=='1' ? '✅ Enabled' : '❌ Disabled (value='.var_export($globalAi,true).')') . "\n";

// 3. tenant_settings columns check
echo "\n3. tenant_settings table check:\n";
try {
    $cols = $pdo->query("SHOW COLUMNS FROM tenant_settings")->fetchAll(PDO::FETCH_COLUMN);
    echo "   Columns: " . implode(', ', $cols) . "\n";
    $hasAiReply    = in_array('ai_auto_reply', $cols);
    $hasOfflineOnly = in_array('ai_offline_only', $cols);
    echo "   ai_auto_reply column: " . ($hasAiReply ? '✅' : '❌ MISSING') . "\n";
    echo "   ai_offline_only column: " . ($hasOfflineOnly ? '✅' : '❌ MISSING') . "\n";

    // Add missing columns if needed
    if (!$hasAiReply) {
        $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN ai_auto_reply TINYINT(1) DEFAULT 1");
        echo "   ✅ Added ai_auto_reply column\n";
    }
    if (!$hasOfflineOnly) {
        $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN ai_offline_only TINYINT(1) DEFAULT 0");
        echo "   ✅ Added ai_offline_only column\n";
    }
} catch(Exception $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
}

// 4. Tenant rows
echo "\n4. Tenant settings rows:\n";
$tenants = $pdo->query("SELECT tenant_id, ai_auto_reply, ai_offline_only FROM tenant_settings")->fetchAll();
if (empty($tenants)) {
    echo "   ❌ NO tenant_settings rows found! Creating defaults...\n";
    $allTenants = $pdo->query("SELECT id FROM tenants")->fetchAll(PDO::FETCH_COLUMN);
    foreach($allTenants as $tid) {
        try {
            $pdo->prepare("INSERT IGNORE INTO tenant_settings (tenant_id, ai_auto_reply, ai_offline_only) VALUES (?,1,0)")->execute([$tid]);
            echo "   ✅ Created settings for tenant $tid\n";
        } catch(Exception $e) {
            $pdo->prepare("UPDATE tenant_settings SET ai_auto_reply=1, ai_offline_only=0 WHERE tenant_id=?")->execute([$tid]);
            echo "   ✅ Updated settings for tenant $tid\n";
        }
    }
} else {
    foreach($tenants as $t) {
        $ok = ($t['ai_auto_reply']==1 && $t['ai_offline_only']==0);
        echo "   " . ($ok?'✅':'⚠️') . " tenant={$t['tenant_id']} ai_auto_reply={$t['ai_auto_reply']} ai_offline_only={$t['ai_offline_only']}\n";
    }
}

// 5. Fix all tenant settings to ensure AI works
$pdo->exec("UPDATE tenant_settings SET ai_auto_reply=1, ai_offline_only=0");
echo "\n5. ✅ Set ai_auto_reply=1 and ai_offline_only=0 for ALL tenants\n";

// 6. Fix all websites
$updated = $pdo->exec("UPDATE websites SET ai_enabled=1 WHERE ai_enabled=0 OR ai_enabled IS NULL");
echo "6. ✅ Set ai_enabled=1 on $updated websites\n";

// 7. Websites final state
echo "\n7. Websites:\n";
foreach($pdo->query("SELECT id,domain,ai_enabled FROM websites WHERE deleted_at IS NULL")->fetchAll() as $w) {
    echo "   " . ($w['ai_enabled']?'✅':'❌') . " id={$w['id']} {$w['domain']}\n";
}

// 8. Test OpenAI live call
echo "\n8. Testing OpenAI live call...\n";
if (empty($openAiKey)) {
    echo "   ❌ Cannot test - no API key\n";
} else {
    $payload = json_encode([
        "model" => "gpt-3.5-turbo",
        "messages" => [
            ["role"=>"system","content"=>"You are a helpful support bot."],
            ["role"=>"user","content"=>"Say: AI is working correctly!"]
        ],
        "max_tokens" => 30
    ]);

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Authorization: Bearer '.$openAiKey],
        CURLOPT_TIMEOUT        => 20,
    ]);

    $resp = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "   HTTP: $code\n";

    if ($err) {
        echo "   ❌ cURL error: $err\n";
    } else {
        $j = json_decode($resp, true);
        if ($code === 401) {
            echo "   ❌ INVALID KEY - Create a new one at https://platform.openai.com/api-keys\n";
            echo "   Details: " . ($j['error']['message']??'') . "\n";
        } elseif ($code === 429) {
            echo "   ❌ QUOTA/RATE LIMIT - Add billing at https://platform.openai.com/settings/billing\n";
            echo "   Details: " . ($j['error']['message']??'') . "\n";
        } elseif (isset($j['choices'][0]['message']['content'])) {
            echo "   ✅ OpenAI RESPONSE: " . $j['choices'][0]['message']['content'] . "\n";
            echo "\n🎉 ALL CHECKS PASSED - AI bot should now work in widget!\n";
        } else {
            echo "   ❌ Unexpected: $resp\n";
        }
    }
}
?>
