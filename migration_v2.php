<?php
// migration_v2.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE websites ADD COLUMN bot_image VARCHAR(255) DEFAULT NULL, ADD COLUMN bot_name VARCHAR(100) DEFAULT 'Bee Bot'");
    echo "SUCCESS: Added bot_image and bot_name columns.";
} catch (Exception $e) {
    echo "ALREADY EXISTS: " . $e->getMessage();
}
?>
