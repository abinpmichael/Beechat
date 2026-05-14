<?php
// migration_v23_email_system.php
require_once 'server/api/config.php';

try {
    $pdo->beginTransaction();

    // 1. Email Templates Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS email_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NULL, -- NULL for system-wide templates
        name VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    echo "SUCCESS: Created email_templates table.\n";

    // 2. Email Queue Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS email_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
        attempts INT DEFAULT 0,
        error_log TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP NULL
    )");
    echo "SUCCESS: Created email_queue table.\n";

    // 3. Insert Default Ticket Template
    $stmt = $pdo->prepare("INSERT INTO email_templates (name, subject, body) VALUES (?, ?, ?)");
    $stmt->execute([
        'ticket_created', 
        'Support Ticket Received: {subject}', 
        "Hello,\n\nWe have received your support request. You can track the status and reply to our agents here:\n\n{tracking_link}\n\nTicket ID: {tracking_id}\n\nThank you,\nThe Bee Chat Team"
    ]);
    echo "SUCCESS: Inserted default email template.\n";

    $pdo->commit();
    echo "SUCCESS: Email system migration completed.";

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo "ERROR: " . $e->getMessage();
}
?>
