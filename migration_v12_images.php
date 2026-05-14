<?php
// migration_v12_images.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE messages ADD COLUMN image TEXT NULL AFTER content");
    echo "SUCCESS: Added image column to messages table.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
