<?php
// migration_v13_system_settings.php
require_once 'server/api/config.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Add default dummy keys for demo
    $pdo->exec("INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES 
        ('stripe_publishable_key', 'pk_test_sample'),
        ('stripe_secret_key', 'sk_test_sample'),
        ('platform_email', 'support@beechat.com')
    ");

    echo "SUCCESS: Created system_settings table.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
