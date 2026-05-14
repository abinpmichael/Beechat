<?php
// migration_v13_email.php — Email System Setup
require_once 'server/api/config.php';

try {
    // 1. Email Templates Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS email_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    echo "✅ Table email_templates created.<br>";

    // 2. Email Queue Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS email_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        attempts INT DEFAULT 0,
        error_log TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP NULL
    ) ENGINE=InnoDB");
    echo "✅ Table email_queue created.<br>";

    // 3. Seed Default Templates
    $templates = [
        [
            'name' => 'welcome_admin',
            'subject' => 'Welcome to Bee Chat, {{name}}!',
            'body' => "<h1>Welcome to the Hive!</h1><p>Hi {{name}},</p><p>Your company <strong>{{company}}</strong> is now active on Bee Chat. You can start managing your chat widget and agents from your dashboard.</p><p><a href='{{login_url}}'>Click here to login</a></p><p>Buzzing with excitement,<br>The Bee Team</p>"
        ],
        [
            'name' => 'ticket_received',
            'subject' => 'Support Request Received: #{{ticket_id}}',
            'body' => "<h1>We've received your request</h1><p>Hello,</p><p>Thank you for reaching out. We've created a support ticket for you (#{{ticket_id}}). One of our agents will be in touch shortly.</p><p><strong>Subject:</strong> {{subject}}</p><p><a href='{{tracking_url}}'>Track your request here</a></p><p>Best regards,<br>Support Team</p>"
        ],
        [
            'name' => 'password_reset',
            'subject' => 'Reset Your Bee Chat Password',
            'body' => "<h1>Password Reset Request</h1><p>Hello,</p><p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p><p><a href='{{reset_url}}'>Reset Password</a></p><p>Security first!<br>The Bee Team</p>"
        ]
    ];

    $stmt = $pdo->prepare("INSERT IGNORE INTO email_templates (name, subject, body) VALUES (?, ?, ?)");
    foreach ($templates as $t) {
        $stmt->execute([$t['name'], $t['subject'], $t['body']]);
    }
    echo "✅ Seeded default email templates.<br>";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "<br>";
}
?>
