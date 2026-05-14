<?php
// migration_v21_advanced_helpdesk.php
require_once 'server/api/config.php';

try {
    $pdo->beginTransaction();

    // 1. Add tracking_id to tickets for public access links
    try {
        $pdo->exec("ALTER TABLE tickets ADD COLUMN tracking_id VARCHAR(50) UNIQUE AFTER id");
        echo "SUCCESS: Added tracking_id to tickets.\n";
    } catch (Exception $e) {
        echo "tracking_id already exists or error: " . $e->getMessage() . "\n";
    }

    // 2. Add last_seen_at to users to track agent online status
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN last_seen_at TIMESTAMP NULL AFTER updated_at");
        echo "SUCCESS: Added last_seen_at to users.\n";
    } catch (Exception $e) {
        echo "last_seen_at already exists or error: " . $e->getMessage() . "\n";
    }

    // 3. Create ticket_replies table
    $pdo->exec("CREATE TABLE IF NOT EXISTS ticket_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NULL, -- NULL if reply is from the visitor
        message TEXT NOT NULL,
        is_private TINYINT(1) DEFAULT 0, -- Agent only notes
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )");
    echo "SUCCESS: Created ticket_replies table.\n";

    // 4. Create attachments table
    $pdo->exec("CREATE TABLE IF NOT EXISTS attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_id INT NULL, -- Link to chat messages
        ticket_reply_id INT NULL, -- Link to ticket replies
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_type VARCHAR(100),
        file_size INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (ticket_reply_id) REFERENCES ticket_replies(id) ON DELETE CASCADE
    )");
    echo "SUCCESS: Created attachments table.\n";

    // 5. Update existing tickets with unique tracking IDs
    $stmt = $pdo->query("SELECT id FROM tickets WHERE tracking_id IS NULL");
    while ($row = $stmt->fetch()) {
        $tid = strtoupper(substr(md5(uniqid()), 0, 10));
        $pdo->prepare("UPDATE tickets SET tracking_id = ? WHERE id = ?")->execute([$tid, $row['id']]);
    }

    $pdo->commit();
    echo "SUCCESS: Advanced Helpdesk migration completed.";

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo "ERROR: " . $e->getMessage();
}
?>
