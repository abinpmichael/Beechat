<?php
// repair_settings_v2.php
require_once 'server/api/config.php';

try {
    $stmt = $pdo->query("DESCRIBE tenant_settings");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('ai_auto_reply', $columns)) {
        $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN ai_auto_reply TINYINT(1) DEFAULT 0");
    }
    if (!in_array('notifications_enabled', $columns)) {
        $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN notifications_enabled TINYINT(1) DEFAULT 1");
    }
    if (!in_array('default_theme_color', $columns)) {
        $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN default_theme_color VARCHAR(20) DEFAULT '#6366f1'");
    }
    if (!in_array('default_bot_name', $columns)) {
        $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN default_bot_name VARCHAR(100) DEFAULT 'Bee Bot'");
    }

    echo "REPAIRED: tenant_settings table updated with AI and Branding columns.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
