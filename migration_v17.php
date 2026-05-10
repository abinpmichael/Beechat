<?php
// migration_v17.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE tenants 
        ADD COLUMN chat_visibility ENUM('private', 'shared') DEFAULT 'shared'
    ");
    echo "SUCCESS: Added chat_visibility setting to tenants table.";
} catch (Exception $e) {
    echo "ALREADY EXISTS or ERROR: " . $e->getMessage();
}
?>
