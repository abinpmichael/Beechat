<?php
require 'server/api/config.php';

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS support_conversations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tenant_id INT NOT NULL,
            status ENUM('open', 'closed') DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS support_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            conversation_id INT NOT NULL,
            sender_id INT NOT NULL,
            sender_name VARCHAR(255) NOT NULL,
            sender_role ENUM('tenant', 'superadmin') NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES support_conversations(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ");
    echo "Support tables created successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
