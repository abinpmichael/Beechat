<?php
// migration_v11_superadmin.php
require_once 'server/api/config.php';

try {
    // 1. Add is_superadmin column to users table
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superadmin TINYINT(1) DEFAULT 0");

    // 2. Make the first user a super admin
    $pdo->exec("UPDATE users SET is_superadmin = 1 ORDER BY id ASC LIMIT 1");

    echo "Migration v11 successful: Super Admin capabilities initialized. The first user in the database is now the Platform Owner.";
} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage();
}
