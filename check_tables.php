<?php
require_once 'server/api/config.php';
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $t) {
    echo "Table: $t\n";
    $columns = $pdo->query("DESCRIBE `$t`")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $c) {
        echo "  - {$c['Field']} ({$c['Type']})\n";
    }
}
