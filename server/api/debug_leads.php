<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once __DIR__ . '/config.php';

echo "Database Connected.<br>";

try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM leads");
    $count = $stmt->fetchColumn();
    echo "Total leads: $count<br>";

    $stmt = $pdo->query("SELECT COUNT(*) FROM leads WHERE is_live = 1");
    $liveCount = $stmt->fetchColumn();
    echo "Live leads: $liveCount<br>";

    $stmt = $pdo->query("SELECT id, details, is_live, chat_status, last_seen_at FROM leads LIMIT 5");
    $leads = $stmt->fetchAll();
    echo "Sample leads (with details JSON):<br><pre>";
    print_r($leads);
    echo "</pre>";

    // Now let's try running the exact UPDATE statement to see if it works or fails/hangs
    echo "Testing UPDATE query...<br>";
    $rowsAffected = $pdo->exec("
        UPDATE leads 
        SET is_live = 0, chat_status = 'ended' 
        WHERE is_live = 1 
          AND chat_status = 'active'
          AND last_seen_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    ");
    echo "UPDATE query completed. Rows affected: $rowsAffected<br>";

} catch (Throwable $e) {
    echo "ERROR (Throwable): " . $e->getMessage() . "<br>";
}
?>
