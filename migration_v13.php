<?php
// migration_v13.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE leads 
        ADD COLUMN is_ticket TINYINT(1) DEFAULT 0,
        ADD COLUMN ticket_subject VARCHAR(255) DEFAULT NULL,
        ADD COLUMN ticket_priority VARCHAR(20) DEFAULT 'medium'
    ");
    echo "SUCCESS: Added Ticketing columns to leads table.";
} catch (Exception $e) {
    echo "ALREADY EXISTS or ERROR: " . $e->getMessage();
}
?>
