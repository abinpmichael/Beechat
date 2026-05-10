<?php
// migration_v12_timezone.php
require_once 'server/api/config.php';

try {
    // 1. Ensure tenant_settings exists (safeguard)
    $pdo->exec("CREATE TABLE IF NOT EXISTS tenant_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT UNIQUE,
        handover_enabled BOOLEAN DEFAULT TRUE,
        visitor_tracking BOOLEAN DEFAULT FALSE,
        default_language VARCHAR(10) DEFAULT 'en',
        opening_time TIME DEFAULT '09:00:00',
        closing_time TIME DEFAULT '18:00:00',
        chat_visibility VARCHAR(20) DEFAULT 'shared',
        ai_auto_reply BOOLEAN DEFAULT FALSE,
        notifications_enabled BOOLEAN DEFAULT TRUE,
        default_theme_color VARCHAR(50) DEFAULT '#6366f1',
        default_bot_name VARCHAR(255) DEFAULT 'Bee Bot',
        timezone VARCHAR(100) DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // 2. Add timezone column if not exists
    try {
        $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN timezone VARCHAR(100) DEFAULT 'UTC' AFTER default_bot_name");
        echo "SUCCESS: Added timezone column to tenant_settings.\n";
    } catch (Exception $e) {
        echo "Timezone column already exists.\n";
    }

    echo "SUCCESS: Timezone infrastructure is ready.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
