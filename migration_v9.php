<?php
// migration_v9.php
require_once 'server/api/config.php';

try {
    // 1. Add status to leads for live tracking
    $pdo->exec("ALTER TABLE leads ADD COLUMN is_live TINYINT(1) DEFAULT 0");
    
    // 2. Create messages table for live chat
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        sender_type ENUM('visitor', 'agent') NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (lead_id)
    )");
    
    echo "SUCCESS: Added Live Chat infrastructure.";
} catch (Exception $e) {
    echo "ALREADY EXISTS: " . $e->getMessage();
}
?>
