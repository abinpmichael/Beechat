<?php
// server/api/fix_admin.php
require_once 'config.php';

try {
    $pdo->beginTransaction();

    // 1. Ensure the system tenant exists
    $stmt = $pdo->prepare("INSERT IGNORE INTO tenants (id, name, slug, plan) VALUES (1, 'Bee Chat System', 'system', 'pro')");
    $stmt->execute();

    // 2. Create/Update the Admin User
    $email = 'admin@beechat.com';
    $password = password_hash('admin123', PASSWORD_DEFAULT);
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $pdo->prepare("UPDATE users SET password = ?, role = 'admin', tenant_id = 1 WHERE email = ?");
        $stmt->execute([$password, $email]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (tenant_id, name, email, password, role) VALUES (1, 'Super Admin', ?, ?, 'admin')");
        $stmt->execute([$email, $password]);
    }

    $pdo->commit();
    echo "<h1>✅ Admin Account Fixed!</h1>";
    echo "<p>You can now log in at <a href='http://localhost:5173/login'>http://localhost:5173/login</a></p>";
    echo "<ul><li><b>Email:</b> admin@beechat.com</li><li><b>Password:</b> admin123</li></ul>";

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo "<h1>❌ Error</h1><p>" . $e->getMessage() . "</p>";
}
?>
