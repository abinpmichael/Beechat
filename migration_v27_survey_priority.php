<?php
// migration_v27_survey_priority.php
require_once 'server/api/config.php';

try {
    echo "Starting Survey Priority V27 Migration...\n";

    // Add survey_priority if it does not exist
    $cols = $pdo->query("SHOW COLUMNS FROM websites LIKE 'survey_priority'")->fetchAll();
    if (empty($cols)) {
        $pdo->exec("ALTER TABLE websites ADD COLUMN survey_priority INT DEFAULT 1;");
        echo "Added 'survey_priority' column.\n";
    } else {
        echo "'survey_priority' column already exists.\n";
    }

    echo "SUCCESS: Survey priority migration applied successfully.\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
