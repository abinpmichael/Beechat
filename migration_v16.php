<?php
// migration_v16.php
require_once 'server/api/config.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS internal_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (tenant_id),
        INDEX (sender_id),
        INDEX (receiver_id)
    )");
    echo "SUCCESS: Created internal_messages table for team chat.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
