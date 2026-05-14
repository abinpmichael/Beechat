<?php
require_once 'server/api/config.php';

try {
    echo "Starting Billing System V24 Migration...\n";

    // 1. Update Plans table
    $pdo->exec("ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_annual DECIMAL(10,2) DEFAULT 0.00;");
    $pdo->exec("ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255) DEFAULT NULL;");
    $pdo->exec("ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_price_monthly VARCHAR(255) DEFAULT NULL;");
    $pdo->exec("ALTER TABLE plans ADD COLUMN IF NOT EXISTS stripe_price_annual VARCHAR(255) DEFAULT NULL;");
    
    // 2. Subscriptions
    $pdo->exec("CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        plan_id INT NOT NULL,
        billing_interval ENUM('monthly', 'annual') DEFAULT 'monthly',
        status VARCHAR(50) DEFAULT 'active',
        stripe_subscription_id VARCHAR(255) DEFAULT NULL,
        current_period_start TIMESTAMP NULL,
        current_period_end TIMESTAMP NULL,
        cancel_at_period_end BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES plans(id)
    );");

    // 3. Invoices
    $pdo->exec("CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        stripe_invoice_id VARCHAR(255) NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'paid',
        pdf_url VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );");

    // 4. Coupons
    $pdo->exec("CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_percent INT DEFAULT 0,
        max_uses INT DEFAULT NULL,
        times_used INT DEFAULT 0,
        expires_at TIMESTAMP NULL,
        stripe_coupon_id VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );");

    // Clear old plans and insert new ones
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE plans;");
    
    // FREE
    $stmt = $pdo->prepare("INSERT INTO plans (name, price, price_annual, max_websites, max_agents, ai_enabled, features) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute(['Free', 0, 0, 1, 1, 0, json_encode(['basic_widget', '7_day_history'])]);
    
    // STARTER
    $stmt->execute(['Starter', 19, 190, 3, 5, 1, json_encode(['unlimited_chats', 'ai_chatbot', 'file_uploads', 'ticket_system'])]);
    
    // PRO
    $stmt->execute(['Pro', 49, 490, 10, 9999, 1, json_encode(['advanced_ai', 'crm_integrations', 'whatsapp', 'white_label', 'api_access'])]);
    
    // ENTERPRISE
    $stmt->execute(['Enterprise', 99, 990, 9999, 9999, 1, json_encode(['dedicated_support', 'custom_branding', 'sla_support', 'custom_api'])]);
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // 5. Update tenants
    $pdo->exec("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) DEFAULT NULL;");

    echo "SUCCESS: Billing schema V24 applied successfully.\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
