<?php
// migration_v12.php — add last_seen_at heartbeat column
require_once 'server/api/config.php';

try {
    $pdo->exec("ALTER TABLE leads ADD COLUMN last_seen_at TIMESTAMP NULL DEFAULT NULL");
    echo "SUCCESS: Added last_seen_at column.<br>";
} catch (Exception $e) {
    echo "SKIP: " . $e->getMessage() . "<br>";
}

// Seed all currently-live leads with NOW() so they don't immediately go offline
try {
    $pdo->exec("UPDATE leads SET last_seen_at = NOW() WHERE is_live = 1");
    echo "SUCCESS: Seeded last_seen_at for existing live leads.<br>";
} catch (Exception $e) {
    echo "SKIP seed: " . $e->getMessage() . "<br>";
}
?>
