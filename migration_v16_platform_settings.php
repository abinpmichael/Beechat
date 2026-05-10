<?php
// migration_v16_platform_settings.php
require_once 'server/api/config.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS platform_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Insert default empty Stripe keys
    $keys = [
        'stripe_publishable_key' => '',
        'stripe_secret_key' => '',
        'stripe_webhook_secret' => '',
        'platform_name' => 'Bee Chat',
        'platform_currency' => 'USD'
    ];

    foreach ($keys as $key => $value) {
        $stmt = $pdo->prepare("INSERT IGNORE INTO platform_settings (setting_key, setting_value) VALUES (?, ?)");
        $stmt->execute([$key, $value]);
    }

    echo "SUCCESS: Platform settings table created and initialized.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
