<?php
require_once 'config.php';
header('Content-Type: text/plain');

$key = $_GET['key'] ?? '';

if (empty($key)) {
    echo "❌ No key provided.\n";
    echo "Usage: https://www.beechat.online/server/api/set_openai_key.php?key=sk-proj-YOUR_KEY_HERE\n";
    exit;
}

// Update
$stmt = $pdo->prepare("UPDATE platform_settings SET setting_value=? WHERE setting_key='openai_api_key'");
$stmt->execute([$key]);

echo "✅ OpenAI key UPDATED in database.\n";
echo "Key saved: " . substr($key, 0, 20) . "... (length=" . strlen($key) . ")\n\n";

$data = json_encode([
    "model" => "gpt-3.5-turbo",
    "messages" => [["role"=>"user","content"=>"Reply: Key is valid!"]],
    "max_tokens" => 10
]);

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $data,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Authorization: Bearer ' . $key],
    CURLOPT_TIMEOUT        => 20,
]);

$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$json = json_decode($resp, true);

if ($code === 200 && isset($json['choices'][0]['message']['content'])) {
    echo "✅ KEY IS VALID! OpenAI replied: " . $json['choices'][0]['message']['content'] . "\n";
    echo "\n🎉 AI bot will now work in your widget!\n";
} else {
    echo "❌ KEY IS INVALID.\n";
    echo "Error: " . ($json['error']['message'] ?? 'Unknown') . "\n";
}
?>
