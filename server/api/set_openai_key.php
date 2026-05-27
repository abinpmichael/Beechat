<?php
// server/api/set_openai_key.php
// Direct key updater - bypasses UI password field issues
// Usage: visit this URL with your key as a GET param (HTTPS only!)
// https://www.beechat.online/server/api/set_openai_key.php?key=sk-proj-YOUR_KEY_HERE
// DELETE THIS FILE after use!

require_once 'config.php';
header('Content-Type: text/plain');

$key = $_GET['key'] ?? '';

if (empty($key)) {
    echo "❌ No key provided.\n";
    echo "Usage: https://www.beechat.online/server/api/set_openai_key.php?key=sk-proj-YOUR_KEY_HERE\n";
    exit;
}

if (!str_starts_with($key, 'sk-')) {
    echo "❌ Invalid key format. OpenAI keys must start with 'sk-'\n";
    echo "Your key starts with: " . substr($key, 0, 5) . "\n";
    exit;
}

// Check if key exists
$stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key='openai_api_key'");
$stmt->execute();
$existing = $stmt->fetchColumn();

if ($existing !== false) {
    // Update
    $stmt = $pdo->prepare("UPDATE platform_settings SET setting_value=? WHERE setting_key='openai_api_key'");
    $stmt->execute([$key]);
    echo "✅ OpenAI key UPDATED in database.\n";
} else {
    // Insert
    $stmt = $pdo->prepare("INSERT INTO platform_settings (setting_key, setting_value) VALUES ('openai_api_key', ?)");
    $stmt->execute([$key]);
    echo "✅ OpenAI key INSERTED in database.\n";
}

echo "Key saved: " . substr($key, 0, 20) . "... (length=" . strlen($key) . ")\n\n";

// Now verify by calling OpenAI
echo "Testing key with OpenAI...\n";

$data = json_encode([
    "model" => "gpt-3.5-turbo",
    "messages" => [
        ["role"=>"user","content"=>"Reply: Key is valid!"]
    ],
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
    echo "⚠️  Please DELETE this file now: server/api/set_openai_key.php\n";
} elseif ($code === 401) {
    echo "❌ KEY IS STILL INVALID.\n";
    echo "Error: " . ($json['error']['message'] ?? 'Unknown') . "\n";
    echo "\nMake sure you:\n";
    echo "1. Copied the FULL key from https://platform.openai.com/api-keys\n";
    echo "2. Added billing at https://platform.openai.com/settings/billing\n";
} elseif ($code === 429) {
    echo "⚠️ KEY IS VALID but quota exceeded.\n";
    echo "Add credits at https://platform.openai.com/settings/billing\n";
} else {
    echo "HTTP $code: $resp\n";
}
?>
