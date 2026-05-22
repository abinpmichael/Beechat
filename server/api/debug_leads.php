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

    // Now let's try running a non-existent row UPDATE statement to see if the table is locked
    echo "Testing UPDATE by non-existent ID...<br>";
    $rowsAffected1 = $pdo->exec("UPDATE leads SET is_live = 0 WHERE id = 999999");
    echo "UPDATE by ID completed. Rows affected: $rowsAffected1<br>";

    // Now let's try updating where is_live = 1
    echo "Testing UPDATE where is_live = 1...<br>";
    $rowsAffected2 = $pdo->exec("UPDATE leads SET is_live = 0 WHERE is_live = 1");
    echo "UPDATE is_live=1 completed. Rows affected: $rowsAffected2<br>";

    // Now let's try updating chat_status
    echo "Testing UPDATE chat_status...<br>";
    $rowsAffected3 = $pdo->exec("UPDATE leads SET chat_status = 'ended' WHERE is_live = 1 AND chat_status = 'active'");
    echo "UPDATE chat_status completed. Rows affected: $rowsAffected3<br>";

} catch (Throwable $e) {
    echo "ERROR (Throwable): " . $e->getMessage() . "<br>";
}
?>
