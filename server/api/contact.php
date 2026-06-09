<?php
// server/api/contact.php
require_once 'config.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $_GET['action'] ?? $data['action'] ?? '';

if ($method === 'OPTIONS') {
    exit;
}

// Self-healing database check
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
} catch (Exception $schemaEx) {
    error_log("contact_messages table check failed: " . $schemaEx->getMessage());
}

if ($method === 'POST') {
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $subject = trim($data['subject'] ?? 'Contact Inquiry');
    $message = trim($data['message'] ?? '');

    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(["error" => "All fields (Name, Email, Message) are required."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid email address."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $subject, $message]);
        
        // Push notification / mail if SMTP is configured
        $supportEmail = 'info@beechat.online';
        try {
            $stmtSupport = $pdo->query("SELECT setting_value FROM platform_settings WHERE setting_key = 'support_email'");
            $resSupport = $stmtSupport->fetchColumn();
            if ($resSupport) $supportEmail = $resSupport;
        } catch (Exception $e) {}

        // Send support notification email via SMTP queue if configured
        try {
            require_once 'mail_service.php';
            $mail = new MailService($pdo);
            
            $tplStmt = $pdo->prepare("SELECT id FROM email_templates WHERE name = ?");
            $tplStmt->execute(['contact_inquiry_received']);
            if (!$tplStmt->fetch()) {
                $insertTpl = $pdo->prepare("INSERT IGNORE INTO email_templates (name, subject, body) VALUES (?, ?, ?)");
                $insertTpl->execute([
                    'contact_inquiry_received',
                    'New Public Inquiry from {name}: {subject}',
                    "Hello Platform Admin,\n\nYou have received a new contact inquiry from your public website:\n\nName: {name}\nEmail: {visitor_email}\nSubject: {subject}\nMessage: {message}\n\nPlease reply directly to their email.\n\nThank you,\nBee Chat Notification"
                ]);
            }

            $mail->queue($supportEmail, 'contact_inquiry_received', [
                'name' => $name,
                'subject' => $subject,
                'visitor_email' => $email,
                'message' => $message
            ]);
        } catch (Exception $mailEx) {
            error_log("Failed to queue contact notification email: " . $mailEx->getMessage());
        }

        echo json_encode(["success" => true, "message" => "Your message has been received. We will get back to you shortly."]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to save message: " . $e->getMessage()]);
    }
    exit;
}
?>
