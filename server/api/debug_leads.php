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

    $stmt = $pdo->query("SELECT id, name, is_live, chat_status, last_seen_at FROM leads WHERE is_live = 1 LIMIT 5");
    $leads = $stmt->fetchAll();
    echo "Sample live leads:<br><pre>";
    print_r($leads);
    echo "</pre>";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "<br>";
}
?>
