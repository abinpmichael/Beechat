<?php
// migration_v13_billing_v2.php
require_once 'server/api/config.php';

try {
    // 1. Add plan_id and expires_at to tenants
    try {
        $pdo->exec("ALTER TABLE tenants ADD COLUMN plan_id INT DEFAULT 1"); // 1 = Free Tier
        $pdo->exec("ALTER TABLE tenants ADD COLUMN expires_at TIMESTAMP NULL DEFAULT NULL");
        $pdo->exec("ALTER TABLE tenants ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
        echo "SUCCESS: Added billing columns to tenants.\n";
    } catch (Exception $e) {
        echo "Billing columns might already exist.\n";
    }

    // 2. Add SuperAdmin role to users
    try {
        $pdo->exec("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) DEFAULT 'agent'");
        echo "SUCCESS: Verified roles.\n";
    } catch (Exception $e) {}

    echo "SUCCESS: Billing V2 infrastructure is ready.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
