<?php
// migration_v18.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE tenant_settings 
        ADD COLUMN chat_visibility ENUM('private', 'shared') DEFAULT 'shared'
    ");
    echo "SUCCESS: Added chat_visibility to tenant_settings table.";
} catch (Exception $e) {
    echo "ALREADY EXISTS or ERROR: " . $e->getMessage();
}
?>
