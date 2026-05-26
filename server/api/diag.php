<?php
// server/api/diag.php
require_once 'config.php';

$messagesColumns = [];
$ticketsColumns = [];
$dbError = null;

try {
    $stmt = $pdo->query("DESCRIBE messages");
    $messagesColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
} catch (Exception $e) {
    $dbError = "messages table query failed: " . $e->getMessage();
}

try {
    $stmt = $pdo->query("DESCRIBE tickets");
    $ticketsColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
} catch (Exception $e) {
    $dbError = ($dbError ? $dbError . "; " : "") . "tickets table query failed: " . $e->getMessage();
}

echo json_encode([
    'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'N/A',
    'http_host' => $_SERVER['HTTP_HOST'] ?? 'N/A',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
    'server_base_url' => getServerBaseUrl(),
    'uploads_exists' => is_dir('../uploads') ? 'yes' : 'no',
    'uploads_writable' => is_writable('../uploads') ? 'yes' : 'no',
    'uploads_real_path' => realpath('../uploads'),
    'php_file_uploads' => ini_get('file_uploads'),
    'php_upload_max_filesize' => ini_get('upload_max_filesize'),
    'php_post_max_size' => ini_get('post_max_size'),
    'messages_columns' => $messagesColumns,
    'tickets_columns' => $ticketsColumns,
    'db_error' => $dbError
]);
?>
