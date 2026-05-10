<?php
// migration_v11_branding.php
require_once 'server/api/config.php';

try {
    // Check if columns exist and add if missing
    $columns = [
        'bot_name' => "VARCHAR(255) DEFAULT 'Bee Bot'",
        'bot_image' => "TEXT",
        'theme_color' => "VARCHAR(50) DEFAULT '#6366f1'",
        'welcome_message' => "TEXT",
        'bot_subtitle' => "VARCHAR(255) DEFAULT 'Support Assistant'",
        'success_message' => "TEXT",
        'survey_config' => "JSON",
        'form_config' => "JSON",
        'header_bg_gradient' => "TEXT",
        'notification_sound' => "TEXT",
        'widget_icon' => "TEXT",
        'ai_enabled' => "BOOLEAN DEFAULT FALSE"
    ];

    foreach ($columns as $col => $def) {
        try {
            $pdo->exec("ALTER TABLE websites ADD COLUMN $col $def");
            echo "Added column: $col\n";
        } catch (Exception $e) {
            echo "Column $col already exists or error: " . $e->getMessage() . "\n";
        }
    }

    echo "SUCCESS: Branding infrastructure is fully synchronized.";
} catch (Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage();
}
?>
