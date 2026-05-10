<?php
// migration_v7.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE websites ADD COLUMN welcome_message TEXT DEFAULT NULL");
    echo "SUCCESS: Added welcome_message column.";
} catch (Exception $e) {
    echo "ALREADY EXISTS: " . $e->getMessage();
}
?>
