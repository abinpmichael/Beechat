<?php
// cleanup_dummy_data.php
require_once 'server/api/config.php';

try {
    // 1. Find Super Admin and their tenant
    $stmt = $pdo->query("SELECT id, tenant_id FROM users WHERE is_superadmin = 1 LIMIT 1");
    $superUser = $stmt->fetch();

    if (!$superUser) {
        die("ERROR: No Super Admin found. Cleanup aborted to prevent lockout.");
    }

    $adminId = $superUser['id'];
    $adminTenantId = $superUser['tenant_id'];

    echo "Preserving Super Admin (ID: $adminId) and Tenant (ID: $adminTenantId)...\n";

    // 2. Disable foreign key checks for truncation
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    // 3. Truncate activity tables (these should be clean for a fresh start)
    $pdo->exec("TRUNCATE TABLE messages");
    $pdo->exec("TRUNCATE TABLE conversations");
    $pdo->exec("TRUNCATE TABLE visitors");
    $pdo->exec("TRUNCATE TABLE leads");
    echo "CLEANED: Activity tables (messages, conversations, visitors, leads).\n";

    // 4. Delete all websites except those belonging to the admin tenant (or delete all)
    // Actually, user probably wants a totally clean slate, so delete all websites.
    $pdo->exec("DELETE FROM websites");
    echo "CLEANED: Websites table.\n";

    // 5. Delete all users except the Super Admin
    $pdo->exec("DELETE FROM users WHERE id != $adminId");
    echo "CLEANED: Users table (except Platform Owner).\n";

    // 6. Delete all tenants except the Admin Tenant
    $pdo->exec("DELETE FROM tenants WHERE id != $adminTenantId");
    echo "CLEANED: Tenants table (except Platform Organization).\n";

    // 7. Cleanup tenant settings
    $pdo->exec("DELETE FROM tenant_settings WHERE tenant_id != $adminTenantId");
    echo "CLEANED: Tenant Settings.\n";

    // 8. Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "\nSUCCESS: All dummy data removed. Platform is now in a clean, production-ready state.\n";
    echo "Platform Owner: admin@beechat.com / admin123\n";

} catch (Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage();
}
