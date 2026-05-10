<?php
// server/api/internal_chat.php
require_once 'config.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $m)) {
    http_response_code(401); exit;
}
$decoded = json_decode(base64_decode($m[1]), true);
$tenantId = $decoded['tenant_id'];
$myId = $decoded['id'];

$method = $_SERVER['REQUEST_METHOD'];
$data   = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    if ($method === 'GET') {
        $otherId = $_GET['otherId'] ?? 'list';
        
        if ($otherId === 'list') {
            // Get list of agents
            $stmt = $pdo->prepare("
                SELECT u.id, u.name, u.email, u.role, u.avatar_url,
                       (SELECT COUNT(*) FROM internal_messages WHERE tenant_id = ? AND receiver_id = ? AND sender_id = u.id AND is_read = 0) as unread_count,
                       (SELECT content FROM internal_messages 
                        WHERE tenant_id = ? AND ((sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?))
                        ORDER BY created_at DESC LIMIT 1) as last_message
                FROM users u 
                WHERE u.tenant_id = ? AND u.id != ?
            ");
            $stmt->execute([$tenantId, $myId, $tenantId, $myId, $myId, $tenantId, $myId]);
            $agents = $stmt->fetchAll();

            // Add the Group Chat to the top
            $stmt = $pdo->prepare("SELECT content FROM internal_messages WHERE tenant_id = ? AND receiver_id = 0 ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$tenantId]);
            $groupLast = $stmt->fetch();
            
            array_unshift($agents, [
                'id' => 0,
                'name' => '📢 General Team Group',
                'role' => 'EVERYONE',
                'unread_count' => 0, // Group unread tracking is complex, keep at 0 for now
                'last_message' => $groupLast['content'] ?? 'Start a group discussion'
            ]);

            echo json_encode($agents);
        } else {
            $otherId = intval($otherId);
            if ($otherId === 0) {
                // Get Group Messages (everyone can see messages with receiver_id = 0)
                $stmt = $pdo->prepare("
                    SELECT m.*, u.name as sender_name 
                    FROM internal_messages m
                    JOIN users u ON m.sender_id = u.id
                    WHERE m.tenant_id = ? AND m.receiver_id = 0
                    ORDER BY m.created_at ASC
                ");
                $stmt->execute([$tenantId]);
            } else {
                // Get Personal Conversation
                $stmt = $pdo->prepare("
                    SELECT m.*, u.name as sender_name 
                    FROM internal_messages m
                    JOIN users u ON m.sender_id = u.id
                    WHERE m.tenant_id = ? 
                    AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
                    ORDER BY m.created_at ASC
                ");
                $stmt->execute([$tenantId, $myId, $otherId, $otherId, $myId]);
                
                // Mark as read (only for personal chats)
                $pdo->prepare("UPDATE internal_messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?")
                    ->execute([$myId, $otherId]);
            }
            echo json_encode($stmt->fetchAll());
        }
    } 
    elseif ($method === 'POST') {
        $receiverId = isset($data['receiverId']) ? intval($data['receiverId']) : -1;
        $content    = trim($data['content'] ?? '');
        
        if ($receiverId === -1 || empty($content)) {
            http_response_code(400); echo json_encode(["error" => "Invalid data"]); exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO internal_messages (tenant_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)");
        $stmt->execute([$tenantId, $myId, $receiverId, $content]);
        
        echo json_encode(["status" => "sent", "id" => $pdo->lastInsertId()]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
