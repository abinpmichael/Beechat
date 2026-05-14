<?php
require_once 'server/api/config.php';

$stmt = $pdo->prepare("INSERT IGNORE INTO email_templates (name, subject, body) VALUES (?, ?, ?)");
$stmt->execute([
    'plan_expired',
    'Action Required: Your Bee Chat Plan has Expired',
    "<h1>Plan Expired</h1><p>Hello {{name}},</p><p>Your Bee Chat subscription plan for <strong>{{company}}</strong> has expired. Access to your dashboard has been restricted.</p><p>Please log in and renew your plan to continue using our services.</p><p><a href='{{login_url}}'>Renew your plan</a></p><p>Best regards,<br>The Bee Team</p>"
]);
echo "Template added successfully.\n";
?>
