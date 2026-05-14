<?php
require_once __DIR__ . '/../server/api/config.php';

try {
    echo "Starting DB seed...\n";
    
    // Clear relevant tables
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE users;");
    $pdo->exec("TRUNCATE TABLE tenants;");
    $pdo->exec("TRUNCATE TABLE plans;");
    $pdo->exec("TRUNCATE TABLE websites;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Insert Default Plan
    $stmt = $pdo->prepare("INSERT INTO plans (name, price, max_websites, max_agents, ai_enabled, features) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute(['Pro Demo', 99.00, 10, 10, 1, json_encode(['live_chat', 'ai_bot'])]);
    $planId = $pdo->lastInsertId();

    // Insert Tenant
    $stmt = $pdo->prepare("INSERT INTO tenants (company_name, email, plan_id, status) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Cognitio IT', 'admin@cognitioit.ca', $planId, 'active']);
    $tenantId = $pdo->lastInsertId();

    // Insert Super Admin User
    $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (tenant_id, name, email, password, role, is_super_admin) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$tenantId, 'Super Admin', 'admin@cognitioit.ca', $passwordHash, 'admin', 1]);

    // Insert Website
    $stmt = $pdo->prepare("INSERT INTO websites (tenant_id, domain, api_key, theme_color, bot_name, welcome_message) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$tenantId, 'demo.cognitioit.ca', 'DEMO_KEY', '#f59e0b', 'Demo Bot', 'Welcome to the Demo!']);

    echo "Seed completed successfully. Demo API Key: DEMO_KEY\n";

} catch (Exception $e) {
    echo "Seed failed: " . $e->getMessage() . "\n";
}
