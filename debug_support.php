<?php
require 'server/api/config.php';
echo "CONVERSATIONS:\n";
print_r($pdo->query("SELECT * FROM support_conversations")->fetchAll(PDO::FETCH_ASSOC));
echo "\nMESSAGES:\n";
print_r($pdo->query("SELECT * FROM support_messages")->fetchAll(PDO::FETCH_ASSOC));
?>
