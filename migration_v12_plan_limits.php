<?php
// migration_v12_plan_limits.php
require_once 'server/api/config.php';

try {
    // Add max_agents column to plans
    $pdo->exec("ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_agents INT DEFAULT 2");
    
    // Update default plans with better limits
    $pdo->exec("UPDATE plans SET max_agents = 2, max_websites = 1 WHERE name = 'Free Tier'");
    $pdo->exec("UPDATE plans SET max_agents = 10, max_websites = 5 WHERE name = 'Growth Plan'");
    $pdo->exec("UPDATE plans SET max_agents = 999, max_websites = 999 WHERE name = 'Enterprise'");

    echo "Migration v12 successful: Plan resource limits updated.";
} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage();
}
