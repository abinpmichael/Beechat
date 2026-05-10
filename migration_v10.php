<?php
// migration_v10.php
require_once 'server/api/config.php';

try {
    // 1. Add assigned_to to leads
    $pdo->exec("ALTER TABLE leads ADD COLUMN assigned_to INT NULL DEFAULT NULL");
    
    // 2. Add agent_id to messages
    $pdo->exec("ALTER TABLE messages ADD COLUMN agent_id INT NULL DEFAULT NULL");
    
    // 3. Add agent_name to messages (cached for speed)
    $pdo->exec("ALTER TABLE messages ADD COLUMN agent_name VARCHAR(100) DEFAULT NULL");
    
    echo "SUCCESS: Enabled Multi-Agent Scaling infrastructure.";
} catch (Exception $e) {
    echo "ALREADY EXISTS: " . $e->getMessage();
}
?>
