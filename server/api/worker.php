<?php
// server/api/worker.php
// This script should be run by a cron job every minute
// * * * * * php /path/to/server/api/worker.php

require_once 'config.php';
require_once 'mail_service.php';

echo "[".date('Y-m-d H:i:s')."] Bee Worker Starting...\n";

try {
    $mail = new MailService($pdo);
    
    // 1. Process Email Queue
    echo "[".date('Y-m-d H:i:s')."] Processing Email Queue...\n";
    $mail->processQueue(20); // Process 20 emails per run
    
    // 2. Clean up stale live sessions (no heartbeat for > 5 mins)
    echo "[".date('Y-m-d H:i:s')."] Cleaning up stale sessions...\n";
    $pdo->exec("
        UPDATE leads 
        SET is_live = 0, chat_status = 'ended' 
        WHERE is_live = 1 
          AND chat_status = 'active'
          AND last_seen_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    ");

    // 3. Process expired plans
    echo "[".date('Y-m-d H:i:s')."] Checking for expired plans...\n";
    $stmt = $pdo->prepare("
        SELECT t.id, t.name as company_name, u.email, u.name as user_name 
        FROM tenants t
        JOIN users u ON u.tenant_id = t.id AND u.role = 'admin'
        WHERE t.is_active = 1 AND t.expires_at IS NOT NULL AND t.expires_at < NOW()
    ");
    $stmt->execute();
    $expiredTenants = $stmt->fetchAll();

    foreach ($expiredTenants as $tenant) {
        $pdo->prepare("UPDATE tenants SET is_active = 0, status = 'suspended' WHERE id = ?")->execute([$tenant['id']]);
        $mail->queue($tenant['email'], 'plan_expired', [
            'name' => $tenant['user_name'],
            'company' => $tenant['company_name'],
            'login_url' => getFrontendBaseUrl() . '/login'
        ]);
        echo "[".date('Y-m-d H:i:s')."] Suspended tenant ID " . $tenant['id'] . " and queued expiry email.\n";
    }

    // 4. Auto-resolve old 'lead' status tickets that are > 30 days old
    // $pdo->exec("UPDATE leads SET chat_status = 'ended' WHERE chat_status = 'lead' AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");

    echo "[".date('Y-m-d H:i:s')."] Worker Finished.\n";

} catch (Exception $e) {
    echo "[".date('Y-m-d H:i:s')."] ERROR: " . $e->getMessage() . "\n";
}
?>
