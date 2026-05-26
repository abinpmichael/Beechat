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
        $action   = $data['action']    ?? $_POST['action']    ?? $_GET['action'] ?? 'send';
        $leadId   = intval($data['leadId']    ?? $_POST['leadId'] ?? 0);
        $agentId  = $data['agentId']   ?? $_POST['agentId'] ?? null;
        $agentName= trim($data['agentName']  ?? $_POST['agentName'] ?? 'Agent');

        // ── UPLOAD IMAGE ──
        if ($action === 'upload') {
            $sender  = $_POST['sender']  ?? 'agent';
            
            // Resolve leadId if it's 0 (e.g. from visitor widget before first chat message)
            if ($leadId === 0 && $sender === 'visitor') {
                $sessionId = $_POST['sessionId'] ?? $_GET['sessionId'] ?? '';
                $apiKey    = $_POST['apiKey']    ?? $_GET['apiKey']    ?? '';
                if ($sessionId && $apiKey) {
                    $stmt = $pdo->prepare("SELECT id, tenant_id FROM websites WHERE api_key = ?");
                    $stmt->execute([$apiKey]);
                    $website = $stmt->fetch();
                    if ($website) {
                        $stmt = $pdo->prepare("SELECT id FROM leads WHERE session_id = ? AND website_id = ?");
                        $stmt->execute([$sessionId, $website['id']]);
                        $lead = $stmt->fetch();
                        if ($lead) {
                            $leadId = (int)$lead['id'];
                        } else {
                            $uid = "V-" . strtoupper(substr(md5($sessionId), 0, 5));
                            $stmt = $pdo->prepare("INSERT INTO leads (tenant_id, website_id, session_id, visitor_uid, chat_status) VALUES (?, ?, ?, ?, 'lead')");
                            $stmt->execute([$website['tenant_id'], $website['id'], $sessionId, $uid]);
                            $leadId = (int)$pdo->lastInsertId();
                        }
                    }
                }
            }
            
            if (isset($_FILES['image'])) {
                $dir = '../uploads/';
                if (!is_dir($dir)) mkdir($dir, 0777, true);
                
                $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                $name = 'chat_' . time() . '_' . rand(1000,9999) . '.' . $ext;
                $path = $dir . $name;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $path)) {
                    $url = getServerBaseUrl() . '/uploads/' . $name;
                    $stmt = $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, image) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$leadId, $sender, 'Sent an image', $url]);
                    $msgId = $pdo->lastInsertId();
                    
                    // Fetch lead details
                    $stmt = $pdo->prepare("SELECT tenant_id, session_id, visitor_uid FROM leads WHERE id = ?");
                    $stmt->execute([$leadId]);
                    $lead = $stmt->fetch();

                    if ($lead) {
                        if ($sender === 'visitor') {
                            triggerNotification($lead['tenant_id'], 'visitor_message', 'New Visitor Message (Image)', "Visitor " . ($lead['visitor_uid'] ?? 'Visitor') . " sent an image.", "/dashboard/leads");

                            $payload = json_encode([
                                'tenantId' => (int)$lead['tenant_id'],
                                'type' => 'message',
                                'data' => [
                                    'id' => $msgId,
                                    'lead_id' => $leadId,
                                    'sender_type' => 'visitor',
                                    'content' => 'Sent an image',
                                    'image' => $url,
                                    'created_at' => date('Y-m-d H:i:s')
                                ]
                            ]);
                            $ch = curl_init("http://localhost:3000/notify");
                            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($ch, CURLOPT_POST, true);
                            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                            curl_setopt($ch, CURLOPT_TIMEOUT, 2);
                            curl_exec($ch);
                            curl_close($ch);
                        } else {
                            $payload = json_encode([
                                'sessionId' => $lead['session_id'],
                                'type' => 'message',
                                'data' => [
                                    'id' => $msgId,
                                    'lead_id' => $leadId,
                                    'sender_type' => 'agent',
                                    'content' => 'Sent an image',
                                    'image' => $url,
                                    'created_at' => date('Y-m-d H:i:s')
                                ]
                            ]);
                            $ch = curl_init("http://localhost:3000/notify-visitor");
                            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($ch, CURLOPT_POST, true);
                            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                            curl_setopt($ch, CURLOPT_TIMEOUT, 2);
                            curl_exec($ch);
                            curl_close($ch);
                        }
                    }

                    echo json_encode(["status" => "success", "url" => $url, "lead_id" => $leadId]);
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

            // GET tenant_id of this lead
            $stmt = $pdo->prepare("SELECT tenant_id, session_id FROM leads WHERE id = ?");
            $stmt->execute([$leadId]);
            $lead = $stmt->fetch();
            if ($lead) {
                // Notify other agents that this chat is claimed
                triggerNotification($lead['tenant_id'], 'chat_assigned', "Chat Claimed", "Agent $agentName joined Chat #$leadId", "/dashboard/leads");
                
                // Notify the visitor widget via Socket.io
                $payload = json_encode([
                    'sessionId' => $lead['session_id'],
                    'type' => 'chat_assigned',
                    'data' => ['agentId' => $agentId, 'agentName' => $agentName]
                ]);
                $ch = curl_init("http://localhost:3000/notify-visitor");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                curl_setopt($ch, CURLOPT_TIMEOUT, 2);
                curl_exec($ch);
                curl_close($ch);
            }

            echo json_encode(["status" => "claimed"]);
            exit;
        }

        // ── END CHAT ──
        if ($action === 'end_chat') {
            $stmt = $pdo->prepare("UPDATE leads SET is_live = 0, chat_status = 'ended' WHERE id = ?");
            $stmt->execute([$leadId]);

            $stmt = $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, agent_id, agent_name) VALUES (?, 'agent', ?, ?, ?)");
            $stmt->execute([$leadId, "🔴 The chat has been ended by $agentName.", $agentId, $agentName]);

            // GET lead details
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ?");
            $stmt->execute([$leadId]);
            $lead = $stmt->fetch();
            if ($lead) {
                $tenantId = $lead['tenant_id'];
                triggerNotification($tenantId, 'chat_ended', "Chat Ended", "Chat with " . ($lead['visitor_uid'] ?? 'Visitor') . " ended", "/dashboard/leads");

                // Notify visitor widget
                $payload = json_encode([
                    'sessionId' => $lead['session_id'],
                    'type' => 'chat_ended',
                    'data' => ['agentName' => $agentName]
                ]);
                $ch = curl_init("http://localhost:3000/notify-visitor");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                curl_setopt($ch, CURLOPT_TIMEOUT, 2);
                curl_exec($ch);
                curl_close($ch);

                // Auto-create ticket if unresolved
                $tCheck = $pdo->prepare("SELECT id FROM tickets WHERE lead_id = ?");
                $tCheck->execute([$leadId]);
                if (!$tCheck->fetch()) {
                    $trackingId = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 10));
                    $subject = "Live Chat Transcript - " . ($lead['visitor_uid'] ?? 'Visitor');
                    
                    $stmt = $pdo->prepare("SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC");
                    $stmt->execute([$leadId]);
                    $msgs = $stmt->fetchAll();
                    $transcript = "";
                    foreach ($msgs as $m) {
                        $senderLabel = $m['sender_type'] === 'visitor' ? 'Visitor' : ($m['agent_name'] ?? 'Agent');
                        $transcript .= "[" . $m['created_at'] . "] " . $senderLabel . ": " . $m['content'] . "\n";
                    }

                    $stmt = $pdo->prepare("INSERT INTO tickets (tenant_id, lead_id, tracking_id, subject, status) VALUES (?, ?, ?, ?, 'open')");
                    $stmt->execute([$tenantId, $leadId, $trackingId, $subject]);
                    $ticketId = $pdo->lastInsertId();

                    $stmt = $pdo->prepare("INSERT INTO ticket_replies (ticket_id, message) VALUES (?, ?)");
                    $stmt->execute([$ticketId, "Auto-generated Ticket from Live Chat.\n\nTranscript:\n" . $transcript]);

                    $leadDetails = json_decode($lead['details'], true) ?? [];
                    $email = $leadDetails['email'] ?? '';
                    if (!empty($email)) {
                        require_once 'mail_service.php';
                        $mail = new MailService($pdo);
                        $trackingLink = getFrontendBaseUrl() . "/ticket/" . $trackingId;
                        $mail->queue($email, 'ticket_created', [
                            'subject' => $subject,
                            'tracking_id' => $trackingId,
                            'tracking_link' => $trackingLink
                        ]);
                    }
                }
            }

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

            // Get tenant & session details
            $stmt = $pdo->prepare("SELECT tenant_id, session_id FROM leads WHERE id = ?");
            $stmt->execute([$leadId]);
            $lead = $stmt->fetch();
            if ($lead) {
                // Trigger notification for the transferred agent B
                triggerNotification($lead['tenant_id'], 'chat_assigned', "Chat Transferred", "Chat #$leadId transferred to $toAgentName", "/dashboard/leads");

                // Notify visitor widget
                $payload = json_encode([
                    'sessionId' => $lead['session_id'],
                    'type' => 'chat_assigned',
                    'data' => ['agentId' => $toAgentId, 'agentName' => $toAgentName]
                ]);
                $ch = curl_init("http://localhost:3000/notify-visitor");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                curl_setopt($ch, CURLOPT_TIMEOUT, 2);
                curl_exec($ch);
                curl_close($ch);
            }

            echo json_encode(["status" => "transferred", "toAgentId" => $toAgentId, "toAgentName" => $toAgentName]);
            exit;
        }

        // ── FLAG FOR FOLLOWUP ──
        if ($action === 'flag_followup') {
            $stmt = $pdo->prepare("UPDATE leads SET followup_required = 1, status = 'Pending Follow-up' WHERE id = ?");
            $stmt->execute([$leadId]);
            
            $stmt = $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, agent_id, agent_name) VALUES (?, 'agent', ?, ?, ?)");
            $stmt->execute([$leadId, "📧 Ticket flagged for email follow-up by $agentName.", $agentId, $agentName]);

            // Get tenant & visitor details
            $stmt = $pdo->prepare("SELECT tenant_id, visitor_uid, details FROM leads WHERE id = ?");
            $stmt->execute([$leadId]);
            $lead = $stmt->fetch();
            if ($lead) {
                triggerNotification($lead['tenant_id'], 'followup_required', 'Email Follow-up Request', "Lead #" . $leadId . " (" . ($lead['visitor_uid'] ?? 'Visitor') . ") flagged for email follow-up.", "/dashboard/leads");

                // Send automatic email to the customer
                $leadDetails = json_decode($lead['details'], true) ?? [];
                $email = $leadDetails['email'] ?? '';
                if (!empty($email)) {
                    require_once 'mail_service.php';
                    $mail = new MailService($pdo);
                    $mail->queue($email, 'followup_initiated', [
                        'ticket_id' => $leadId,
                        'subject' => 'We are following up on your inquiry'
                    ]);
                }
            }

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
            $msgId = $pdo->lastInsertId();

            // Keep lead live while messages flow
            $pdo->prepare("UPDATE leads SET is_live = 1 WHERE id = ? AND is_live = 0")->execute([$leadId]);

            // Fetch lead details (tenant_id, session_id, visitor_uid)
            $stmt = $pdo->prepare("SELECT tenant_id, session_id, visitor_uid FROM leads WHERE id = ?");
            $stmt->execute([$leadId]);
            $lead = $stmt->fetch();

            if ($lead) {
                if ($sender === 'visitor') {
                    // 1. Trigger Dashboard Notification for new visitor message
                    triggerNotification($lead['tenant_id'], 'visitor_message', 'New Visitor Message', "Visitor " . ($lead['visitor_uid'] ?? 'Visitor') . ": " . $content, "/dashboard/leads");

                    // 2. Broadcast visitor message via Socket.IO
                    $payload = json_encode([
                        'tenantId' => (int)$lead['tenant_id'],
                        'type' => 'message',
                        'data' => [
                            'id' => $msgId,
                            'lead_id' => $leadId,
                            'sender_type' => 'visitor',
                            'content' => $content,
                            'created_at' => date('Y-m-d H:i:s')
                        ]
                    ]);
                    $ch = curl_init("http://localhost:3000/notify");
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
                    curl_exec($ch);
                    curl_close($ch);

                } else if ($sender === 'agent') {
                    // Broadcast agent message to visitor widget via Socket.IO
                    $payload = json_encode([
                        'sessionId' => $lead['session_id'],
                        'type' => 'message',
                        'data' => [
                            'id' => $msgId,
                            'lead_id' => $leadId,
                            'sender_type' => 'agent',
                            'content' => $content,
                            'agent_id' => $agentId,
                            'agent_name' => $agentName,
                            'created_at' => date('Y-m-d H:i:s')
                        ]
                    ]);
                    $ch = curl_init("http://localhost:3000/notify-visitor");
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
                    curl_exec($ch);
                    curl_close($ch);
                }
            }

            echo json_encode(["status" => "success", "id" => $msgId]);
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
