<?php
// migration_v4.php
require_once 'server/api/config.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        website_id INT,
        session_id VARCHAR(100),
        details JSON,
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "SUCCESS: Created leads table.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
