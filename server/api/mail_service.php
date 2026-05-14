<?php
// server/api/mail_service.php
require_once 'config.php';

class MailService {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Queues an email for sending.
     */
    public function queue($recipient, $templateName, $data = []) {
        try {
            // 1. Get template
            $stmt = $this->pdo->prepare("SELECT subject, body FROM email_templates WHERE name = ?");
            $stmt->execute([$templateName]);
            $template = $stmt->fetch();

            if (!$template) return false;

            $subject = $template['subject'];
            $body    = $template['body'];

            // 2. Replace placeholders
            foreach ($data as $key => $val) {
                $subject = str_replace("{{$key}}", $val, $subject);
                $body    = str_replace("{{$key}}", $val, $body);
            }

            // 3. Insert into queue
            $stmt = $this->pdo->prepare("INSERT INTO email_queue (recipient, subject, body) VALUES (?, ?, ?)");
            return $stmt->execute([$recipient, $subject, $body]);
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Processes the pending email queue.
     * This would ideally be called by a cron job every minute.
     */
    public function processQueue($limit = 10) {
        $stmt = $this->pdo->prepare("SELECT * FROM email_queue WHERE status = 'pending' LIMIT ?");
        $stmt->execute([$limit]);
        $emails = $stmt->fetchAll();

        foreach ($emails as $email) {
            $this->sendEmail($email);
        }
    }

    private function sendEmail($emailRecord) {
        $id = $emailRecord['id'];
        $to = $emailRecord['recipient'];
        $subject = $emailRecord['subject'];
        $message = $emailRecord['body'];
        
        // Fetch SMTP Settings
        $stmt = $this->pdo->prepare("SELECT setting_key, setting_value FROM platform_settings WHERE setting_key LIKE 'smtp_%'");
        $stmt->execute();
        $settings = [];
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        $host = $settings['smtp_host'] ?? 'smtp.example.com';
        $port = (int)($settings['smtp_port'] ?? 587);
        $user = $settings['smtp_user'] ?? 'user';
        $pass = $settings['smtp_pass'] ?? 'pass';
        $fromEmail = $settings['smtp_from_email'] ?? 'noreply@beechat.pro';
        $fromName  = $settings['smtp_from_name']  ?? 'Bee Chat Support';

        require_once 'vendor/autoload.php';

        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = $host;
            $mail->SMTPAuth   = true;
            $mail->Username   = $user;
            $mail->Password   = $pass;
            $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $port;

            // Recipients
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($to);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = nl2br($message);
            $mail->AltBody = strip_tags($message);

            $mail->send();
            
            $this->pdo->prepare("UPDATE email_queue SET status = 'sent', sent_at = NOW() WHERE id = ?")->execute([$id]);
        } catch (Exception $e) {
            $this->pdo->prepare("UPDATE email_queue SET status = 'failed', attempts = attempts + 1, error_log = ? WHERE id = ?")
                 ->execute([$mail->ErrorInfo, $id]);
        }
    }
}
?>
