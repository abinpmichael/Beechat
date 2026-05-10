<?php
// migration_v19.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE websites 
        ADD COLUMN form_config JSON DEFAULT NULL
    ");
    echo "SUCCESS: Added form_config to websites table.";
} catch (Exception $e) {
    echo "ALREADY EXISTS or ERROR: " . $e->getMessage();
}
?>
