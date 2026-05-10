<?php
// migration_v10_billing.php
require_once 'server/api/config.php';

try {
    // 1. Update tenants table
    $pdo->exec("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'");
    $pdo->exec("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_id INT DEFAULT NULL");
    $pdo->exec("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP NULL DEFAULT NULL");

    // 2. Create plans table
    $pdo->exec("CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        features JSON,
        max_websites INT DEFAULT 1,
        max_chats_per_month INT DEFAULT 100,
        ai_enabled TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 3. Insert default plans
    $stmt = $pdo->query("SELECT COUNT(*) FROM plans");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO plans (name, price, features, max_websites, max_chats_per_month, ai_enabled) VALUES 
            ('Free Tier', 0.00, '[\"1 Website\", \"100 Chats/mo\", \"Basic Bot\"]', 1, 100, 0),
            ('Growth Plan', 29.00, '[\"3 Websites\", \"Unlimited Chats\", \"Custom Branding\"]', 3, 999999, 1),
            ('Enterprise', 99.00, '[\"Unlimited Sites\", \"Priority Support\", \"White Label\"]', 999, 999999, 1)
        ");
    }

    echo "Migration v10 successful: Billing and Plans system initialized.";
} catch (Exception $e) {
    echo "Migration error: " . $e->getMessage();
}
