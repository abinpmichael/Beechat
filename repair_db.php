<?php
// repair_db.php
require_once 'server/api/config.php';

try {
    // Check if table exists and has lead_id
    $stmt = $pdo->query("DESCRIBE messages");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('lead_id', $columns)) {
        // If it's missing or misspelled, let's just recreate it correctly
        $pdo->exec("DROP TABLE IF EXISTS messages");
        $pdo->exec("CREATE TABLE messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            lead_id INT NOT NULL,
            sender_type ENUM('visitor', 'agent') NOT NULL,
            content TEXT NOT NULL,
            agent_id INT NULL,
            agent_name VARCHAR(100) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (lead_id)
        )");
        echo "REPAIRED: Recreated messages table with lead_id.";
    } else {
        echo "OK: lead_id column exists.";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
