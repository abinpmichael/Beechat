<?php
// migration_v14.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE websites 
        ADD COLUMN header_bg_gradient VARCHAR(255) DEFAULT NULL,
        ADD COLUMN notification_sound TEXT DEFAULT NULL,
        ADD COLUMN widget_icon TEXT DEFAULT NULL
    ");
    echo "SUCCESS: Added advanced branding columns (header_bg, sound, icon) to websites table.";
} catch (Exception $e) {
    echo "ALREADY EXISTS or ERROR: " . $e->getMessage();
}
?>
