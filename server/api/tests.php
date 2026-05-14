<?php
// server/api/tests.php
require_once 'config.php';

$headers = getAuthHeaders();
$auth = decodeJwt($headers);

if (!$auth || ($auth['is_superadmin'] ?? 0) !== 1) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized: SuperAdmin only"]);
    exit;
}

$action = $_GET['action'] ?? 'list';

function runTest($name, $callback) {
    $start = microtime(true);
    try {
        $result = $callback();
        $end = microtime(true);
        return [
            'name' => $name,
            'status' => $result['status'] ?? 'passed',
            'message' => $result['message'] ?? 'OK',
            'latency' => round(($end - $start) * 1000)
        ];
    } catch (Exception $e) {
        $end = microtime(true);
        return [
            'name' => $name,
            'status' => 'failed',
            'message' => $e->getMessage(),
            'latency' => round(($end - $start) * 1000)
        ];
    }
}

if ($action === 'run') {
    $type = $_GET['type'] ?? 'API';
    $results = [];

    // Test 1: DB Connection
    $results[] = runTest("Database Connection", function() use ($pdo) {
        $pdo->query("SELECT 1");
        return ['status' => 'passed', 'message' => 'Connected to bee_chat'];
    });

    // Test 2: AI Engine Config
    $results[] = runTest("AI Engine Configuration", function() use ($pdo) {
        $stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'openai_api_key'");
        $stmt->execute();
        $key = $stmt->fetchColumn();
        if (!$key) return ['status' => 'failed', 'message' => 'OpenAI API Key not set'];
        return ['status' => 'passed', 'message' => 'API Key detected'];
    });

    // Test 3: Mail Service
    $results[] = runTest("Mail Service Readiness", function() use ($pdo) {
        $stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'smtp_host'");
        $stmt->execute();
        if (!$stmt->fetchColumn()) return ['status' => 'failed', 'message' => 'SMTP not configured'];
        return ['status' => 'passed', 'message' => 'SMTP configured'];
    });

    // Test 4: Filesystem Permissions
    $results[] = runTest("Uploads Directory Permissions", function() {
        $dir = '../uploads';
        if (!is_writable($dir)) return ['status' => 'failed', 'message' => 'Uploads dir not writable'];
        return ['status' => 'passed', 'message' => 'Writable'];
    });

    // Save to DB
    foreach ($results as $res) {
        $stmt = $pdo->prepare("INSERT INTO system_tests (test_name, status, message, latency_ms) 
                             VALUES (?, ?, ?, ?) 
                             ON DUPLICATE KEY UPDATE status=?, message=?, latency_ms=?, last_run=NOW()");
        // Wait, system_tests needs a unique key on test_name for ON DUPLICATE KEY to work easily
        // I'll just check existence
        $check = $pdo->prepare("SELECT id FROM system_tests WHERE test_name = ?");
        $check->execute([$res['name']]);
        if ($check->fetch()) {
            $pdo->prepare("UPDATE system_tests SET status=?, message=?, latency_ms=?, last_run=NOW() WHERE test_name=?")
                ->execute([$res['status'], $res['message'], $res['latency'], $res['name']]);
        } else {
            $pdo->prepare("INSERT INTO system_tests (test_name, status, message, latency_ms) VALUES (?, ?, ?, ?)")
                ->execute([$res['name'], $res['status'], $res['message'], $res['latency']]);
        }
    }

    echo json_encode(["message" => "Tests completed", "results" => $results]);
    exit;
}

if ($action === 'list') {
    $stmt = $pdo->query("SELECT * FROM system_tests ORDER BY last_run DESC");
    echo json_encode($stmt->fetchAll());
    exit;
}
