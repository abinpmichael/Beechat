<?php
// repair_settings.php
require_once 'server/api/config.php';

try {
    // 1. Create tenant_settings table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS tenant_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT UNIQUE NOT NULL,
        handover_enabled TINYINT(1) DEFAULT 1,
        visitor_tracking TINYINT(1) DEFAULT 0,
        default_language VARCHAR(10) DEFAULT 'en',
        opening_time TIME DEFAULT '09:00:00',
        closing_time TIME DEFAULT '18:00:00',
        chat_visibility ENUM('shared', 'private') DEFAULT 'shared',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    )");

    // 2. Add columns if missing (in case table exists but is old)
    $stmt = $pdo->query("DESCRIBE tenant_settings");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('chat_visibility', $columns)) {
        $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN chat_visibility ENUM('shared', 'private') DEFAULT 'shared'");
    }

    echo "REPAIRED: tenant_settings table and columns verified.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
