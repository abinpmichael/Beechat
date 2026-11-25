#!/usr/bin/env php
<?php
// server/api/worker.php
// This script should be run by a cron job every minute
// * * * * * php /path/to/server/api/worker.php

// Can run from CLI cron or a URL cron (wget/curl). Over the web, the detailed
// log is kept out of the response (it names tenants and shows errors).
$isCli = (PHP_SAPI === 'cli');
$workerOk = false;
$workerStats = [];
error_reporting(E_ALL);
ini_set('display_errors', $isCli ? '1' : '0');
if (!$isCli) {
    ob_start();
    register_shutdown_function(function () {
        while (ob_get_level() > 0) { ob_end_clean(); }
        $ok = !empty($GLOBALS['workerOk']);
        if (!headers_sent()) {
            http_response_code($ok ? 200 : 500);
            header('Content-Type: application/json');
        }
        // Counts only: never names recipients or tenants.
        echo json_encode(array_merge(['status' => $ok ? 'ok' : 'error', 'ts' => date('Y-m-d H:i:s')], $GLOBALS['workerStats']));
    });
}

// Skip if a previous run is still going (stops overlapping runs).
$lock = fopen(sys_get_temp_dir() . '/beechat_worker.lock', 'c');
if ($lock && !flock($lock, LOCK_EX | LOCK_NB)) {
    echo "Worker already running.\n";
    exit;
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mail_service.php';

echo "[".date('Y-m-d H:i:s')."] Bee Worker Starting...\n";

try {
    $mail = new MailService($pdo);
    
    // 1. Process Email Queue
    echo "[".date('Y-m-d H:i:s')."] Processing Email Queue...\n";
    $q = $mail->processQueue(20); // Process 20 emails per run
    $workerStats['emails_found']  = $q['found'];
    $workerStats['emails_sent']   = $q['sent'];
    $workerStats['emails_failed'] = $q['failed'];
    echo "[".date('Y-m-d H:i:s')."] Emails: {$q['sent']} sent, {$q['failed']} failed of {$q['found']} found.\n";
    
    // 2. Clean up stale live sessions (no heartbeat for > 5 mins)
    echo "[".date('Y-m-d H:i:s')."] Cleaning up stale sessions...\n";
    $workerStats['sessions_closed'] = (int)$pdo->exec("
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

    $workerStats['plans_suspended'] = count($expiredTenants);
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
    $workerOk = true;

} catch (Exception $e) {
    echo "[".date('Y-m-d H:i:s')."] ERROR: " . $e->getMessage() . "\n";
}
?>
