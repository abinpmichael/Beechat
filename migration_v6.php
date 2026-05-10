<?php
// migration_v6.php
require_once 'server/api/config.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS tenant_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT UNIQUE,
        handover_enabled TINYINT(1) DEFAULT 1,
        visitor_tracking TINYINT(1) DEFAULT 0,
        default_language VARCHAR(10) DEFAULT 'en',
        opening_time TIME DEFAULT '09:00:00',
        closing_time TIME DEFAULT '18:00:00',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    echo "SUCCESS: Created tenant_settings table.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
