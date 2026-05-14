<?php
// migration_v13_comprehensive_updates.php
require_once 'server/api/config.php';

try {
    // 1. Soft Delete for Websites
    try {
        $pdo->exec("ALTER TABLE websites ADD COLUMN deleted_at DATETIME NULL");
        echo "Added deleted_at to websites\n";
    } catch (Exception $e) { echo "deleted_at exists\n"; }

    // 2. Notifications Table
    $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "Created notifications table\n";

    // 3. Visitor Metadata for Leads
    $leadCols = [
        'country' => "VARCHAR(100)",
        'browser' => "VARCHAR(100)",
        'device' => "VARCHAR(100)",
        'current_page' => "TEXT",
        'last_active' => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ];
    foreach ($leadCols as $col => $def) {
        try {
            $pdo->exec("ALTER TABLE leads ADD COLUMN $col $def");
            echo "Added $col to leads\n";
        } catch (Exception $e) { echo "$col exists\n"; }
    }

    // 4. Ticket Improvements
    $ticketCols = [
        'priority' => "ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium'",
        'department' => "VARCHAR(100) DEFAULT 'Support'",
        'internal_notes' => "TEXT"
    ];
    foreach ($ticketCols as $col => $def) {
        try {
            $pdo->exec("ALTER TABLE tickets ADD COLUMN $col $def");
            echo "Added $col to tickets\n";
        } catch (Exception $e) { echo "$col exists\n"; }
    }

    // 5. Website Flow Priority Settings
    try {
        $pdo->exec("ALTER TABLE websites ADD COLUMN flow_priority VARCHAR(50) DEFAULT 'welcome_first'");
        echo "Added flow_priority to websites\n";
    } catch (Exception $e) { echo "flow_priority exists\n"; }

    echo "SUCCESS: Comprehensive schema updates complete.";
} catch (Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage();
}
?>
