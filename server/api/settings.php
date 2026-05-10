<?php
// server/api/settings.php
require_once 'config.php';
header("Content-Type: application/json");

$stmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN ('platform_name', 'google_client_id')");
$settings = [];
foreach ($stmt->fetchAll() as $row) {
    $settings[$row['setting_key']] = $row['setting_value'];
}

// Defaults
if (!isset($settings['platform_name'])) $settings['platform_name'] = 'Bee Chat';
if (!isset($settings['google_client_id'])) $settings['google_client_id'] = '';

echo json_encode($settings);
