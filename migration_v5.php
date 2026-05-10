<?php
// migration_v5.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE websites ADD COLUMN theme_color VARCHAR(20) DEFAULT '#6366f1'");
    echo "SUCCESS: Added theme_color column.";
} catch (Exception $e) {
    echo "ALREADY EXISTS: " . $e->getMessage();
}
?>
