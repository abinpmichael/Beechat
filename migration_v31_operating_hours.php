<?php
// migration_v31_operating_hours.php – add timezone & operating‑hours to tenant_settings
require_once __DIR__.'/../server/api/config.php';

try {
    // timezone – store IANA zone string, default UTC
    $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'UTC'");
    echo "SUCCESS: added timezone column to tenant_settings\n";
} catch (Exception $e) {
    echo "ERROR adding timezone: " . $e->getMessage() . "\n";
}

try {
    // opening_time and closing_time – store TIME, default 00:00:00 (open all day)
    $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN opening_time TIME NOT NULL DEFAULT '00:00:00'");
    $pdo->exec("ALTER TABLE tenant_settings ADD COLUMN closing_time TIME NOT NULL DEFAULT '23:59:59'");
    echo "SUCCESS: added opening_time & closing_time columns to tenant_settings\n";
} catch (Exception $e) {
    echo "ERROR adding hours: " . $e->getMessage() . "\n";
}
?>
