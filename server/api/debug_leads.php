<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once __DIR__ . '/config.php';

try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM leads");
    $count = $stmt->fetchColumn();
    echo "Total leads: $count<br>";

    $stmt = $pdo->query("SELECT COUNT(*) FROM leads WHERE is_live = 1");
    $liveCount = $stmt->fetchColumn();
    echo "Live leads: $liveCount<br>";

    echo "Active MySQL Processlist:<br><pre>";
    $stmtProcess = $pdo->query("SHOW PROCESSLIST");
    print_r($stmtProcess->fetchAll());
    echo "</pre>";

    echo "InnoDB Status:<br><pre>";
    try {
        $stmtInnodb = $pdo->query("SHOW ENGINE INNODB STATUS");
        print_r($stmtInnodb->fetch());
    } catch (Exception $ex) {
        echo "Could not query InnoDB status: " . $ex->getMessage();
    }
    echo "</pre>";

} catch (Throwable $e) {
    echo "ERROR (Throwable): " . $e->getMessage() . "<br>";
}
?>
