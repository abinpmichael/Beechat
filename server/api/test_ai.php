<?php
// server/api/test_ai.php - test OpenAI connection
require_once 'config.php';

header('Content-Type: text/plain');

echo "=== BeeChat AI Test ===\n\n";

// 1. Check OpenAI key
$stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key='openai_api_key'");
$stmt->execute();
$openAiKey = $stmt->fetchColumn();

if (empty($openAiKey)) {
    echo "❌ NO OpenAI key found in database.\n";
    echo "Go to Super Admin → Settings → OpenAI API Key and save your key.\n";
    exit;
}

echo "✅ OpenAI key found: " . substr($openAiKey, 0, 15) . "...\n\n";

// 2. Check global AI toggle
$globalAi = $pdo->query("SELECT setting_value FROM platform_settings WHERE setting_key='enable_ai_bot'")->fetchColumn();
echo ($globalAi == '1' ? "✅" : "❌") . " Global AI enabled: " . ($globalAi ?: 'not set') . "\n";

// 3. Check websites
$websites = $pdo->query("SELECT id, domain, ai_enabled FROM websites WHERE deleted_at IS NULL")->fetchAll();
echo "\nWebsites:\n";
foreach ($websites as $w) {
    echo ($w['ai_enabled'] ? "  ✅" : "  ❌") . " id={$w['id']} {$w['domain']} - ai_enabled={$w['ai_enabled']}\n";
}

// 4. Check tenant settings
$tenants = $pdo->query("SELECT tenant_id, ai_auto_reply, ai_offline_only FROM tenant_settings")->fetchAll();
echo "\nTenant Settings:\n";
foreach ($tenants as $t) {
    echo "  tenant={$t['tenant_id']} ai_auto_reply={$t['ai_auto_reply']} ai_offline_only={$t['ai_offline_only']}\n";
}

// 5. Test actual OpenAI call
echo "\n=== Testing OpenAI API call... ===\n";

$data = [
    "model" => "gpt-3.5-turbo",
    "messages" => [
        ["role" => "system", "content" => "You are a helpful assistant."],
        ["role" => "user", "content" => "Reply with exactly: AI is working!"]
    ],
    "max_tokens" => 20
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $openAiKey
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";

if ($curlError) {
    echo "❌ Connection error: $curlError\n";
    exit;
}

$json = json_decode($response, true);

if ($httpCode === 401) {
    echo "❌ INVALID API KEY - Please create a new key at https://platform.openai.com/api-keys\n";
    echo "   Error: " . ($json['error']['message'] ?? 'Unknown') . "\n";
} elseif ($httpCode === 429) {
    echo "❌ QUOTA EXCEEDED - Add billing at https://platform.openai.com/settings/billing\n";
    echo "   Error: " . ($json['error']['message'] ?? 'Unknown') . "\n";
} elseif (isset($json['choices'][0]['message']['content'])) {
    echo "✅ SUCCESS! AI Response: " . $json['choices'][0]['message']['content'] . "\n";
    echo "\n🎉 AI bot is ready to use in your widget!\n";
} else {
    echo "❌ Unexpected response:\n" . $response . "\n";
}
?>
