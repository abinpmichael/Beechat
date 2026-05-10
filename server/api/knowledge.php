<?php
// server/api/knowledge.php
require_once 'config.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    exit;
}

$token = $matches[1];
$decoded = json_decode(base64_decode($token), true);
$tenantId = $decoded['tenant_id'];

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $websiteId = $_GET['website_id'] ?? null;
        if (!$websiteId) {
            http_response_code(400);
            echo json_encode(["message" => "Website ID required"]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM knowledge_base WHERE tenant_id = ? AND website_id = ? ORDER BY created_at DESC");
        $stmt->execute([$tenantId, $websiteId]);
        echo json_encode($stmt->fetchAll());
        exit;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? 'add';

        if ($action === 'add') {
            $stmt = $pdo->prepare("INSERT INTO knowledge_base (tenant_id, website_id, title, content, source_url) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $tenantId, 
                $data['website_id'], 
                $data['title'], 
                $data['content'], 
                $data['source_url'] ?? ''
            ]);
            echo json_encode(["message" => "Knowledge item added successfully", "id" => $pdo->lastInsertId()]);
        }

        if ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM knowledge_base WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$data['id'], $tenantId]);
            echo json_encode(["message" => "Knowledge item deleted"]);
        }
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
