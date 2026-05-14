<?php
// migration_v22_ai_rules.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN ai_offline_only TINYINT(1) DEFAULT 1 AFTER ai_auto_reply");
    echo "SUCCESS: Added ai_offline_only column to tenant_settings.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
