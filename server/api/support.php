<?php
// server/api/support.php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$data   = json_decode(file_get_contents("php://input"), true) ?? [];

$headers = getAuthHeaders();
$auth = decodeJwt($headers);

if (!$auth) { 
    http_response_code(401); 
    echo json_encode(["error" => "Unauthorized access. Please login again."]);
    exit; 
}

$userId   = $auth['id'];
$tenantId = $auth['tenant_id'];
$isSuper  = $auth['is_superadmin'] ?? 0;

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'messages';

        if ($action === 'list_conversations' && $isSuper) {
            $stmt = $pdo->query("
                SELECT c.*, t.name as company_name, 
                       (SELECT content FROM support_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM support_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
                FROM support_conversations c
                JOIN tenants t ON c.tenant_id = t.id
                ORDER BY last_message_at DESC
            ");
            echo json_encode($stmt->fetchAll());
            exit;
        }

        // Get or Create conversation for the tenant
        $targetTenantId = $isSuper ? intval($_GET['tenantId'] ?? 0) : $tenantId;
        
        $stmt = $pdo->prepare("SELECT id FROM support_conversations WHERE tenant_id = ? AND status = 'open'");
        $stmt->execute([$targetTenantId]);
        $conv = $stmt->fetch();

        if (!$conv) {
            if ($isSuper) { echo json_encode([]); exit; } // SuperAdmin shouldn't create it this way
            $stmt = $pdo->prepare("INSERT INTO support_conversations (tenant_id) VALUES (?)");
            $stmt->execute([$targetTenantId]);
            $convId = $pdo->lastInsertId();
        } else {
            $convId = $conv['id'];
        }

        // Get messages
        $stmt = $pdo->prepare("SELECT * FROM support_messages WHERE conversation_id = ? ORDER BY created_at ASC");
        $stmt->execute([$convId]);
        echo json_encode([
            "conversation_id" => $convId,
            "messages" => $stmt->fetchAll()
        ]);
        exit;
    }

    if ($method === 'POST') {
        $convId  = intval($data['conversation_id'] ?? 0);
        $content = trim($data['content'] ?? '');
        $senderName = $data['sender_name'] ?? 'User';

        if (!$convId || !$content) { http_response_code(400); exit; }

        $senderRole = $isSuper ? 'superadmin' : 'tenant';

        $stmt = $pdo->prepare("INSERT INTO support_messages (conversation_id, sender_id, sender_name, sender_role, content) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$convId, $userId, $senderName, $senderRole, $content]);

        echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
