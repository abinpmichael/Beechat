<?php
// migration_v14_superadmin_role.php
require_once 'server/api/config.php';

try {
    // 1. Add is_superadmin to users
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN is_superadmin BOOLEAN DEFAULT FALSE");
        echo "SUCCESS: Added is_superadmin column to users.\n";
    } catch (Exception $e) {
        echo "Column might already exist.\n";
    }

    // 2. Make the FIRST user a superadmin (assuming it's the owner)
    $pdo->exec("UPDATE users SET is_superadmin = TRUE LIMIT 1");
    echo "SUCCESS: Promoted first user to SuperAdmin.\n";

    echo "SUCCESS: SuperAdmin role infrastructure is ready.";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
