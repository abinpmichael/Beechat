<?php
// server/api/fix_admin.php
require_once 'config.php';

try {
    echo "<h1>🛠️ Bee Chat Live Database Diagnostics & Auto-Setup</h1>";
    echo "<p>Running automatic schema checks and table initialization...</p>";
    
    // Disable FK checks temporarily during setup
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");

    // 1. Tenants Table & Updates
    $pdo->exec("CREATE TABLE IF NOT EXISTS tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        stripe_customer_id VARCHAR(255),
        plan VARCHAR(50) DEFAULT 'pro',
        status VARCHAR(20) DEFAULT 'active',
        plan_id INT DEFAULT NULL,
        expires_at TIMESTAMP NULL DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        trial_ends_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    try { $pdo->exec("ALTER TABLE tenants ADD COLUMN status VARCHAR(20) DEFAULT 'active'"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE tenants ADD COLUMN plan_id INT DEFAULT NULL"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE tenants ADD COLUMN expires_at TIMESTAMP NULL DEFAULT NULL"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE tenants ADD COLUMN is_active BOOLEAN DEFAULT TRUE"); } catch (Exception $e) {}

    // 2. Users Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'agent',
        is_super_admin TINYINT(1) DEFAULT 0,
        is_superadmin TINYINT(1) DEFAULT 0,
        avatar_url TEXT,
        last_seen_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    )");
    try { $pdo->exec("ALTER TABLE users ADD COLUMN is_super_admin TINYINT(1) DEFAULT 0"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN is_superadmin TINYINT(1) DEFAULT 0"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN last_seen_at TIMESTAMP NULL DEFAULT NULL"); } catch (Exception $e) {}

    // 3. Websites
    $pdo->exec("CREATE TABLE IF NOT EXISTS websites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        domain VARCHAR(255) NOT NULL,
        api_key VARCHAR(100) UNIQUE NOT NULL,
        settings JSON,
        theme_color VARCHAR(20) DEFAULT '#f59e0b',
        bot_name VARCHAR(100) DEFAULT 'Bee Bot',
        welcome_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    )");

    // 4. Visitors
    $pdo->exec("CREATE TABLE IF NOT EXISTS visitors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        website_id INT,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        ip_address VARCHAR(45),
        location JSON,
        browser VARCHAR(255),
        os VARCHAR(255),
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL
    )");

    // 5. Leads
    $pdo->exec("CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        website_id INT,
        session_id VARCHAR(100),
        details JSON,
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // 6. Conversations
    $pdo->exec("CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        visitor_id INT,
        agent_id INT,
        status VARCHAR(50) DEFAULT 'open',
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
    )");

    // 7. Messages
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NULL,
        lead_id INT NULL,
        sender_type VARCHAR(50) NOT NULL,
        sender_id INT,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        agent_id INT NULL,
        agent_name VARCHAR(100) NULL,
        sentiment VARCHAR(20) DEFAULT 'neutral',
        file_url TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )");
    try { $pdo->exec("ALTER TABLE messages ADD COLUMN sentiment VARCHAR(20) DEFAULT 'neutral'"); } catch (Exception $e) {}

    // 8. Plans
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
    $stmt = $pdo->query("SELECT COUNT(*) FROM plans");
    if ($stmt->fetchColumn() == 0) {
        $pdo->exec("INSERT INTO plans (name, price, features, max_websites, max_chats_per_month, ai_enabled) VALUES 
            ('Free Tier', 0.00, '[\"1 Website\", \"100 Chats/mo\", \"Basic Bot\"]', 1, 100, 0),
            ('Growth Plan', 29.00, '[\"3 Websites\", \"Unlimited Chats\", \"Custom Branding\"]', 3, 999999, 1),
            ('Enterprise', 99.00, '[\"Unlimited Sites\", \"Priority Support\", \"White Label\"]', 999, 999999, 1)
        ");
    }

    // 9. Platform Settings
    $pdo->exec("CREATE TABLE IF NOT EXISTS platform_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    $platformKeys = [
        'stripe_publishable_key' => '',
        'stripe_secret_key' => '',
        'stripe_webhook_secret' => '',
        'platform_name' => 'Bee Chat',
        'platform_currency' => 'USD',
        'seo_title' => 'Bee Chat | AI-Powered Customer Support Platform',
        'seo_description' => 'Manage your customer support like a colony. Fast, intelligent, and real-time AI-powered chat for modern businesses.',
        'seo_keywords' => 'AI Chat, Live Support, Customer Engagement, SaaS Chat, Real-time Messaging',
        'seo_canonical_url' => 'https://www.beechat.online/',
        'seo_author' => 'Bee Chat Team',
        'seo_robots' => 'index, follow',
        'og_title' => 'Bee Chat | The Ultimate AI Chat Platform',
        'og_description' => 'Fast, intelligent, and real-time AI-powered chat for modern businesses.',
        'og_image' => '/og-image.png',
        'twitter_handle' => '@BeeChatAI',
        'aeo_llm_summary' => '# Bee Chat AI Overview\nBee Chat is an enterprise-grade AI customer support platform combining real-time human agent handovers with autonomous AI support bots trained on tenant-specific knowledge bases.',
        'aeo_product_features' => '["Autonomous AI Support Bot", "Live Agent Handover", "Multi-Tenant Architecture", "Real-Time Visitor Intelligence", "Automated Helpdesk Ticketing", "Global & Tenant Knowledge Base"]',
        'aeo_faq_json' => '[{"q":"What is Bee Chat?","a":"Bee Chat is an advanced customer support platform with AI auto-replies and real-time agent handover."},{"q":"How does the AI Bot work?","a":"The AI bot learns from your website and custom documents to provide instant accurate answers 24/7."}]',
        'geo_region' => 'US-CA',
        'geo_placename' => 'San Francisco, California',
        'geo_position' => '37.7749;-122.4194',
        'geo_target_country' => 'Global',
        'enable_registration' => '1',
        'enable_ai_bot' => '1',
        'enable_live_chat' => '1',
        'enable_ticketing' => '1',
        'enable_billing' => '1',
        'landing_page_active' => '1'
    ];
    foreach ($platformKeys as $k => $v) {
        $stmt = $pdo->prepare("INSERT IGNORE INTO platform_settings (setting_key, setting_value) VALUES (?, ?)");
        $stmt->execute([$k, $v]);
    }

    // 10. Tenant Settings
    $pdo->exec("CREATE TABLE IF NOT EXISTS tenant_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT UNIQUE NOT NULL,
        handover_enabled TINYINT(1) DEFAULT 1,
        visitor_tracking TINYINT(1) DEFAULT 0,
        default_language VARCHAR(10) DEFAULT 'en',
        opening_time TIME DEFAULT '09:00:00',
        closing_time TIME DEFAULT '18:00:00',
        chat_visibility ENUM('shared', 'private') DEFAULT 'shared',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    )");

    // 11. Knowledge Base
    $pdo->exec("CREATE TABLE IF NOT EXISTS knowledge_base (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        website_id INT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        source_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
    )");

    // 12. Tickets
    $pdo->exec("CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tracking_id VARCHAR(50) UNIQUE,
        tenant_id INT,
        lead_id INT,
        subject VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'medium',
        assigned_to INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    )");

    // 13. Ticket Replies
    $pdo->exec("CREATE TABLE IF NOT EXISTS ticket_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NULL,
        message TEXT NOT NULL,
        is_private TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )");

    // 14. Attachments
    $pdo->exec("CREATE TABLE IF NOT EXISTS attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_id INT NULL,
        ticket_reply_id INT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_type VARCHAR(100),
        file_size INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (ticket_reply_id) REFERENCES ticket_replies(id) ON DELETE CASCADE
    )");

    // 15. System Tests
    $pdo->exec("CREATE TABLE IF NOT EXISTS system_tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_name VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'passed',
        message TEXT,
        latency_ms INT DEFAULT 0,
        last_run TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // 16. System Settings
    $pdo->exec("CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT
    )");

    // Re-enable FK checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo "<p style='color:green;'>✅ All tables verified & missing schema structures created.</p>";

    // Ensure System Tenant exists
    $stmt = $pdo->prepare("INSERT IGNORE INTO tenants (id, name, slug, plan, status) VALUES (1, 'Bee Chat System', 'system', 'pro', 'active')");
    $stmt->execute();

    // Ensure Super Admin User exists and has correct flags
    $email = 'admin@beechat.com';
    $password = password_hash('admin123', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $pdo->prepare("UPDATE users SET role = 'admin', is_super_admin = 1, is_superadmin = 1, tenant_id = 1 WHERE email = ?");
        $stmt->execute([$email]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (tenant_id, name, email, password, role, is_super_admin, is_superadmin) VALUES (1, 'Super Admin', ?, ?, 'admin', 1, 1)");
        $stmt->execute([$email, $password]);
    }

    echo "<h2 style='color:green;'>🎉 Live Database & Landing Page Successfully Initialized!</h2>";
    echo "<p>Your landing page (`/`) will now show correctly, and Super Admin permissions are fully active.</p>";
    echo "<ul>
        <li><b>Admin Login:</b> <a href='https://www.beechat.online/login'>https://www.beechat.online/login</a></li>
        <li><b>Email:</b> admin@beechat.com</li>
        <li><b>Password:</b> admin123</li>
    </ul>";
    echo "<p><a href='https://www.beechat.online/' style='padding:10px 20px; background:#f59e0b; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;'>Go to Landing Page 🚀</a></p>";

} catch (Exception $e) {
    echo "<h1>❌ Error Initializing Database</h1><p>" . $e->getMessage() . "</p>";
}
?>
