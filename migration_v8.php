<?php
// migration_v8.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE websites 
        ADD COLUMN bot_subtitle VARCHAR(100) DEFAULT 'Support Assistant',
        ADD COLUMN offline_message TEXT DEFAULT NULL,
        ADD COLUMN success_message TEXT DEFAULT NULL
    ");
    echo "SUCCESS: Added bot_subtitle, offline_message, and success_message columns.";
} catch (Exception $e) {
    echo "ALREADY EXISTS: " . $e->getMessage();
}
?>
