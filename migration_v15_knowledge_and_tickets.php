<?php
// migration_v15_knowledge_and_tickets.php
require_once 'server/api/config.php';

try {
    // 1. Knowledge Base Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS knowledge_base (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        website_id INT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        source_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
    )");
    echo "SUCCESS: Created knowledge_base table.\n";

    // 2. Tickets Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        lead_id INT,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'medium',
        assigned_to INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    )");
    echo "SUCCESS: Created tickets table.\n";

    // 3. Add Sentiment Column to messages (Roadmap item)
    try {
        $pdo->exec("ALTER TABLE messages ADD COLUMN sentiment VARCHAR(20) DEFAULT 'neutral'");
        echo "SUCCESS: Added sentiment analysis column.\n";
    } catch (Exception $e) {
        echo "Sentiment column already exists.\n";
    }

    echo "SUCCESS: Roadmap Phase 1 infrastructure is ready.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
