<?php
// migration_v20_system_toggles.php
require_once 'server/api/config.php';

try {
    // These keys will be added to platform_settings if they don't exist
    $keys = [
        'enable_registration' => '1',
        'enable_ai_bot' => '1',
        'enable_live_chat' => '1',
        'enable_ticketing' => '1',
        'enable_billing' => '1',
        'landing_page_active' => '1'
    ];

    foreach ($keys as $key => $value) {
        $stmt = $pdo->prepare("INSERT IGNORE INTO platform_settings (setting_key, setting_value) VALUES (?, ?)");
        $stmt->execute([$key, $value]);
    }

    echo "SUCCESS: System toggles initialized in platform_settings.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
