<?php
// fix_billing_schema.php
require_once 'server/api/config.php';

try {
    // 1. Add expires_at if missing
    try {
        $pdo->exec("ALTER TABLE tenants ADD COLUMN expires_at TIMESTAMP NULL DEFAULT NULL");
        echo "SUCCESS: Added expires_at.\n";
    } catch (Exception $e) { echo "expires_at already exists or error: " . $e->getMessage() . "\n"; }

    // 2. Add is_active if missing
    try {
        $pdo->exec("ALTER TABLE tenants ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
        echo "SUCCESS: Added is_active.\n";
    } catch (Exception $e) { echo "is_active already exists or error: " . $e->getMessage() . "\n"; }

    // 3. Ensure plan_id is defaulted correctly
    $pdo->exec("UPDATE tenants SET plan_id = 1 WHERE plan_id IS NULL");
    echo "SUCCESS: Initialized plan_id for existing users.";
} catch (Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage();
}
?>
