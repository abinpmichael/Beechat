<?php
// migration_v11.php
require_once 'server/api/config.php';
$results = [];

$migrations = [
    "ALTER TABLE leads ADD COLUMN chat_status VARCHAR(20) DEFAULT 'waiting'",
    "ALTER TABLE leads ADD COLUMN transferred_to INT NULL DEFAULT NULL",
    "ALTER TABLE leads ADD COLUMN transferred_to_name VARCHAR(100) NULL DEFAULT NULL",
    "ALTER TABLE leads ADD COLUMN visitor_uid VARCHAR(20) NULL DEFAULT NULL",
    "UPDATE leads SET chat_status='active' WHERE is_live=1 AND assigned_to IS NOT NULL AND chat_status IS NULL",
    "UPDATE leads SET chat_status='waiting' WHERE is_live=1 AND assigned_to IS NULL AND chat_status IS NULL",
];

foreach ($migrations as $sql) {
    try { $pdo->exec($sql); $results[] = "OK: $sql"; }
    catch (Exception $e) { $results[] = "SKIP: " . $e->getMessage(); }
}

// Generate visitor_uid for any leads that don't have one
try {
    $rows = $pdo->query("SELECT id FROM leads WHERE visitor_uid IS NULL OR visitor_uid=''")->fetchAll();
    $stmt = $pdo->prepare("UPDATE leads SET visitor_uid=? WHERE id=?");
    foreach ($rows as $r) {
        $uid = 'BEE-' . strtoupper(substr(md5($r['id'] . 'bee_salt_2026'), 0, 6));
        $stmt->execute([$uid, $r['id']]);
    }
    $results[] = "OK: Generated visitor_uid for " . count($rows) . " leads.";
} catch (Exception $e) { $results[] = "SKIP uid gen: " . $e->getMessage(); }

echo '<pre>' . implode("\n", $results) . '</pre>';
?>
