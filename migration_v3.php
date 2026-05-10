<?php
// migration_v3.php
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE websites ADD COLUMN survey_config JSON DEFAULT NULL");
    echo "SUCCESS: Added survey_config column.";
} catch (Exception $e) {
    echo "ALREADY EXISTS: " . $e->getMessage();
}
?>
