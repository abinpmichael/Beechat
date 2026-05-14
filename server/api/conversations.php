<?php
// server/api/conversations.php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data   = json_decode(file_get_contents("php://input"), true) ?? [];

// ─── Auth helper ──────────────────────────────────────────────────────────────
function getAuthInfo() {
    $token = getBearerToken();
    if (!$token) return null;
    return decodeJwt($token);
}

try {
    $auth = getAuthInfo();
    $isSuper = (int)($auth['is_superadmin'] ?? 0) === 1;

    // ─── GET actions ─────────────────────────────────────────────────────────
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'messages';
        $leadId = intval($_GET['leadId'] ?? 0);
        
        $tenantId = $auth['tenant_id'] ?? null;
        
        if (!$tenantId) {
            // Check if it's a widget request (API Key)
            $apiKey    = $_GET['apiKey']    ?? '';
            if ($apiKey && $leadId) {
                $stmt = $pdo->prepare("SELECT l.tenant_id FROM leads l JOIN websites w ON l.website_id = w.id WHERE l.id = ? AND w.api_key = ?");
                $stmt->execute([$leadId, $apiKey]);
                $valid = $stmt->fetch();
                if ($valid) $tenantId = $valid['tenant_id'];
            }
        }

        if (!$tenantId && !$isSuper) { http_response_code(401); exit(json_encode(["error"=>"Unauthorized"])); }

        // ── LIST VISITOR HISTORY (By Session ID) ──
        if ($action === 'list_visitor_history') {
            $sessionId = $_GET['sessionId'] ?? '';
            if (!$sessionId) { echo json_encode([]); exit; }

            $stmt = $pdo->prepare("
                SELECT l.*, w.domain,
                       (SELECT content FROM messages WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM messages WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as last_message_at
                FROM leads l
                JOIN websites w ON l.website_id = w.id
                WHERE l.tenant_id = ? AND l.session_id = ?
                ORDER BY l.created_at DESC
            ");
            $stmt->execute([$tenantId, $sessionId]);
            echo json_encode($stmt->fetchAll());
            exit;
        }

        // ── LIST ALL (Admin History) ──
        if ($action === 'list_all') {
            $stmt = $pdo->prepare("
                SELECT l.*, w.domain, 
                       (SELECT content FROM messages WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM messages WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as last_message_at
                FROM leads l
                JOIN websites w ON l.website_id = w.id
                WHERE l.tenant_id = ?
                ORDER BY last_message_at DESC
            ");
            $stmt->execute([$tenantId]);
            echo json_encode($stmt->fetchAll());
            exit;
        }

        // ── GET MESSAGES for a lead ──
        if ($leadId === 0) { http_response_code(400); echo json_encode(["error" => "leadId required"]); exit; }

        // Heartbeat: update last_seen_at so admin sees them as live
        $pdo->prepare("UPDATE leads SET last_seen_at = NOW() WHERE id = ?")->execute([$leadId]);

        $stmt = $pdo->prepare("SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC");
        $stmt->execute([$leadId]);
        echo json_encode($stmt->fetchAll());
        exit;
    }

    // ─── POST actions ─────────────────────────────────────────────────────────
    if ($method === 'POST') {
        $action   = $data['action']    ?? $_POST['action'] ?? 'send';
        $leadId   = intval($data['leadId']    ?? $_POST['leadId'] ?? 0);
        $agentId  = $data['agentId']   ?? $_POST['agentId'] ?? null;
        $agentName= trim($data['agentName']  ?? $_POST['agentName'] ?? 'Agent');

        // ── UPLOAD IMAGE ──
        if ($action === 'upload') {
            $sender  = $_POST['sender']  ?? 'agent';
            
            if (isset($_FILES['image'])) {
                $dir = '../uploads/';
                if (!is_dir($dir)) mkdir($dir, 0777, true);
                
                $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                $name = 'chat_' . time() . '_' . rand(1000,9999) . '.' . $ext;
                $path = $dir . $name;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $path)) {
                    $url = 'api/uploads/' . $name;
                    $stmt = $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, image) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$leadId, $sender, 'Sent an image', $url]);
                    echo json_encode(["status" => "success", "url" => $url]);
                    exit;
                }
            }
            echo json_encode(["error" => "Upload failed"]);
            exit;
        }

        // ── CLAIM ──
        if ($action === 'claim') {
            $stmt = $pdo->prepare("UPDATE leads SET assigned_to = ?, is_live = 1, chat_status = 'active' WHERE id = ?");
            $stmt->execute([$agentId, $leadId]);

            $stmt = $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, agent_id, agent_name) VALUES (?, 'agent', ?, ?, ?)");
            $stmt->execute([$leadId, "✅ Agent $agentName has joined the chat.", $agentId, $agentName]);

            echo json_encode(["status" => "claimed"]);
            exit;
        }

        // ── END CHAT ──
        if ($action === 'end_chat') {
            $stmt = $pdo->prepare("UPDATE leads SET is_live = 0, chat_status = 'ended' WHERE id = ?");
            $stmt->execute([$leadId]);

            $stmt = $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, agent_id, agent_name) VALUES (?, 'agent', ?, ?, ?)");
            $stmt->execute([$leadId, "🔴 The chat has been ended by $agentName.", $agentId, $agentName]);

            echo json_encode(["status" => "ended"]);
            exit;
        }

        // ── TRANSFER CHAT ──
        if ($action === 'transfer') {
            $toAgentId   = intval($data['toAgentId']   ?? 0);
            $toAgentName = trim($data['toAgentName']   ?? 'Another Agent');

            if ($toAgentId === 0) { http_response_code(400); echo json_encode(["error" => "toAgentId required"]); exit; }

            // Re-assign to the new agent
            $stmt = $pdo->prepare("UPDATE leads SET assigned_to = ?, transferred_to = ?, transferred_to_name = ?, chat_status = 'active' WHERE id = ?");
            $stmt->execute([$toAgentId, $toAgentId, $toAgentName, $leadId]);

            // System messages for both parties
            $stmt = $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, agent_id, agent_name) VALUES (?, 'agent', ?, ?, ?)");
            $stmt->execute([$leadId, "🔄 Chat transferred from $agentName to $toAgentName.", $agentId, $agentName]);

            echo json_encode(["status" => "transferred", "toAgentId" => $toAgentId, "toAgentName" => $toAgentName]);
            exit;
        }

        // ── FLAG FOR FOLLOWUP ──
        if ($action === 'flag_followup') {
            $stmt = $pdo->prepare("UPDATE leads SET followup_required = 1 WHERE id = ?");
            $stmt->execute([$leadId]);
            
            $stmt = $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, agent_id, agent_name) VALUES (?, 'agent', ?, ?, ?)");
            $stmt->execute([$leadId, "📧 Ticket flagged for email follow-up by $agentName.", $agentId, $agentName]);

            echo json_encode(["status" => "flagged"]);
            exit;
        }

        // ── UPDATE INTERNAL NOTES ──
        if ($action === 'update_notes') {
            $notes = $data['notes'] ?? '';
            $stmt = $pdo->prepare("UPDATE leads SET internal_notes = ? WHERE id = ?");
            $stmt->execute([$notes, $leadId]);
            echo json_encode(["status" => "notes_updated"]);
            exit;
        }

        // ── SEND MESSAGE ──
        if ($action === 'send' || !isset($data['action'])) {
            $content = trim($data['content'] ?? '');
            $sender  = $data['sender'] ?? 'agent';

            if (empty($content)) { http_response_code(400); echo json_encode(["error" => "content required"]); exit; }

            $stmt = $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, agent_id, agent_name) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$leadId, $sender, $content, $agentId, $agentName]);

            // Keep lead live while messages flow
            $pdo->prepare("UPDATE leads SET is_live = 1 WHERE id = ? AND is_live = 0")->execute([$leadId]);

            echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
            exit;
        }

        http_response_code(400);
        echo json_encode(["error" => "Unknown action: $action"]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
