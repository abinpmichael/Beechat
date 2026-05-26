<?php
// migration_v30_jitsi_domain.php
require_once 'server/api/config.php';

try {
    echo "Starting Jitsi domain setting seed...\n";

    $stmt = $pdo->prepare("INSERT INTO platform_settings (setting_key, setting_value) VALUES ('jitsi_domain', 'meet.jit.si') ON DUPLICATE KEY UPDATE setting_value = COALESCE(setting_value, 'meet.jit.si')");
    $stmt->execute();

    echo "SUCCESS: Jitsi domain setting initialized in database.\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
