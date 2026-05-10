<?php
// migration.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE websites ADD COLUMN ai_enabled BOOLEAN DEFAULT FALSE");
    echo "SUCCESS: Added ai_enabled column to websites table.";
} catch (Exception $e) {
    echo "ERROR or ALREADY EXISTS: " . $e->getMessage();
}
?>
