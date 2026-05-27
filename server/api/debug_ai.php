<?php
// server/api/debug_ai.php
// TEMPORARY DEBUG FILE - DELETE AFTER USE
require_once 'config.php';

header('Content-Type: application/json');

$apiKey = $_GET['apiKey'] ?? '';
if (empty($apiKey)) {
    echo json_encode(['error' => 'Pass ?apiKey=YOUR_WIDGET_KEY']);
    exit;
}

$results = [];

// 1. Check OpenAI key
$stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'openai_api_key'");
$stmt->execute();
$openAiKey = $stmt->fetchColumn();
$results['openai_key_set'] = !empty($openAiKey);
$results['openai_key_preview'] = $openAiKey ? substr($openAiKey, 0, 10) . '...' : 'NOT SET';

// 2. Check global AI toggle
$stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'enable_ai_bot'");
$stmt->execute();
$globalAi = $stmt->fetchColumn();
$results['global_ai_enabled'] = $globalAi;

// 3. Check website ai_enabled
$stmt = $pdo->prepare("SELECT id, tenant_id, ai_enabled FROM websites WHERE api_key=?");
$stmt->execute([$apiKey]);
$website = $stmt->fetch();
$results['website_found'] = (bool)$website;
$results['website_ai_enabled'] = $website['ai_enabled'] ?? 'N/A';
$results['website_id'] = $website['id'] ?? 'N/A';
$results['tenant_id'] = $website['tenant_id'] ?? 'N/A';

if ($website) {
    // 4. Check tenant settings
    $stmt = $pdo->prepare("SELECT ai_auto_reply, ai_offline_only, force_ai FROM tenant_settings WHERE tenant_id = ?");
    $stmt->execute([$website['tenant_id']]);
    $settings = $stmt->fetch();
    $results['ai_auto_reply'] = $settings['ai_auto_reply'] ?? 'NOT SET (defaults to 1)';
    $results['ai_offline_only'] = $settings['ai_offline_only'] ?? 'NOT SET (defaults to 1)';
    $results['force_ai'] = $settings['force_ai'] ?? 'NOT SET (defaults to 0)';

    // 5. Check if agents are online
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE tenant_id = ? AND last_seen_at > (NOW() - INTERVAL 1 MINUTE)");
    $stmt->execute([$website['tenant_id']]);
    $agentsOnline = $stmt->fetchColumn();
    $results['agents_online_count'] = (int)$agentsOnline;

    // 6. Evaluate shouldTriggerAI
    $aiAutoReply = isset($settings['ai_auto_reply']) ? (int)$settings['ai_auto_reply'] : 1;
    $forceAI = $settings['force_ai'] ?? 0;
    $shouldTriggerAI = ($globalAi == '1' && $aiAutoReply === 1 && isset($website['ai_enabled']) && (int)$website['ai_enabled'] === 1);
    if ($shouldTriggerAI && $agentsOnline > 0 && ($settings['ai_offline_only'] ?? 1) == 1 && !$forceAI) {
        $shouldTriggerAI = false;
        $results['ai_blocked_reason'] = 'Agents are online AND ai_offline_only=1. AI is suppressed. Set force_ai=1 or ai_offline_only=0 in tenant_settings.';
    }
    $results['should_trigger_ai'] = $shouldTriggerAI;

    // 7. Check knowledge base
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM knowledge_base WHERE tenant_id = ? AND website_id = ?");
    $stmt->execute([$website['tenant_id'], $website['id']]);
    $results['knowledge_base_items'] = (int)$stmt->fetchColumn();

    // 8. Test OpenAI connection
    if (!empty($openAiKey)) {
        $testData = [
            "model" => "gpt-3.5-turbo",
            "messages" => [["role" => "user", "content" => "Say OK"]],
            "max_tokens" => 5
        ];
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $openAiKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $resp = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($curlErr) {
            $results['openai_test'] = 'CURL ERROR: ' . $curlErr;
        } else {
            $json = json_decode($resp, true);
            if (isset($json['choices'][0]['message']['content'])) {
                $results['openai_test'] = 'SUCCESS: ' . $json['choices'][0]['message']['content'];
            } elseif (isset($json['error'])) {
                $results['openai_test'] = 'API ERROR: ' . $json['error']['message'];
            } else {
                $results['openai_test'] = 'UNEXPECTED RESPONSE: ' . $resp;
            }
        }
    } else {
        $results['openai_test'] = 'SKIPPED - No API key set';
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
