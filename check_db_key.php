<?php
require 'server/api/config.php';
echo $pdo->query("SELECT setting_value FROM platform_settings WHERE setting_key='openai_api_key'")->fetchColumn();
?>
