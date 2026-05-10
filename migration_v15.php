<?php
// migration_v15.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE leads 
        ADD COLUMN followup_required TINYINT(1) DEFAULT 0,
        ADD COLUMN internal_notes TEXT DEFAULT NULL
    ");
    echo "SUCCESS: Added followup_required and internal_notes columns to leads table.";
} catch (Exception $e) {
    echo "ALREADY EXISTS or ERROR: " . $e->getMessage();
}
?>
