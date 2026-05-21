<?php
// server/api/tickets.php
require_once 'config.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $_GET['action'] ?? $data['action'] ?? '';

// HELPER: Generate unique tracking ID
function generateTrackingId() {
    return strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 10));
}

try {
    /* ── PUBLIC TRACKING ACCESS ────────────────────────────────── */
    if ($action === 'track') {
        $trackingId = $_GET['id'] ?? '';
        if (empty($trackingId)) exit(json_encode(["error" => "ID required"]));

        $stmt = $pdo->prepare("
            SELECT t.*, l.visitor_uid, l.phone, w.domain, w.theme_color, w.bot_name
            FROM tickets t
            JOIN leads l ON t.lead_id = l.id
            JOIN websites w ON l.website_id = w.id
            WHERE t.tracking_id = ?
        ");
        $stmt->execute([$trackingId]);
        $ticket = $stmt->fetch();

        if (!$ticket) exit(json_encode(["error" => "Ticket not found"]));

        // Get replies
        $stmt = $pdo->prepare("
            SELECT r.*, u.name as agent_name, u.avatar_url
            FROM ticket_replies r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.ticket_id = ? AND r.is_private = 0
            ORDER BY r.created_at ASC
        ");
        $stmt->execute([$ticket['id']]);
        $ticket['replies'] = $stmt->fetchAll();

        echo json_encode($ticket);
        exit;
    }

    /* ── CREATE TICKET (Public from Widget) ────────────────────── */
    if ($action === 'create') {
        $apiKey  = $data['apiKey'] ?? '';
        $subject = $data['subject'] ?? 'New Support Request';
        $message = $data['message'] ?? '';
        $email   = $data['email'] ?? '';
        $phone   = $data['phone'] ?? '';
        $sessionId = $data['sessionId'] ?? '';

        if (empty($apiKey) || empty($message)) exit(json_encode(["error" => "Missing data"]));

        // 1. Verify Website
        $stmt = $pdo->prepare("SELECT id, tenant_id FROM websites WHERE api_key = ?");
        $stmt->execute([$apiKey]);
        $site = $stmt->fetch();
        if (!$site) exit(json_encode(["error" => "Invalid API Key"]));

        // 2. Find or Create Lead
        $stmt = $pdo->prepare("SELECT id FROM leads WHERE session_id = ? AND website_id = ?");
        $stmt->execute([$sessionId, $site['id']]);
        $lead = $stmt->fetch();
        $leadId = $lead ? $lead['id'] : null;

        if (!$leadId) {
            $uid = "V-" . strtoupper(substr(md5($sessionId), 0, 5));
            $stmt = $pdo->prepare("INSERT INTO leads (tenant_id, website_id, session_id, visitor_uid, phone, chat_status, details) VALUES (?, ?, ?, ?, ?, 'ticket', ?)");
            $stmt->execute([$site['tenant_id'], $site['id'], $sessionId, $uid, $phone, json_encode(['email' => $email])]);
            $leadId = $pdo->lastInsertId();
        } else {
            // Update lead info
            $pdo->prepare("UPDATE leads SET phone = ?, chat_status = 'ticket' WHERE id = ?")->execute([$phone, $leadId]);
        }

        // 3. Create Ticket
        $trackingId = generateTrackingId();
        $stmt = $pdo->prepare("INSERT INTO tickets (tenant_id, lead_id, tracking_id, subject, status) VALUES (?, ?, ?, ?, 'open')");
        $stmt->execute([$site['tenant_id'], $leadId, $trackingId, $subject]);
        $ticketId = $pdo->lastInsertId();

        // 4. Save Initial Message as first reply
        $stmt = $pdo->prepare("INSERT INTO ticket_replies (ticket_id, message) VALUES (?, ?)");
        $stmt->execute([$ticketId, $message]);

        // Trigger Notification
        triggerNotification($site['tenant_id'], 'new_ticket', 'New Ticket Raised', "Ticket #$trackingId: $subject", "/dashboard/tickets");

        // 5. Send Notification (SMTP Integration)
        require_once 'mail_service.php';
        $mail = new MailService($pdo);
        $trackingLink = getFrontendBaseUrl() . "/ticket/" . $trackingId; // TODO: Use platform setting for URL
        
        if (!empty($email)) {
            $mail->queue($email, 'ticket_created', [
                'subject' => $subject,
                'tracking_id' => $trackingId,
                'tracking_link' => $trackingLink
            ]);
        }

        echo json_encode([
            "success" => true,
            "tracking_id" => $trackingId,
            "message" => "Ticket created successfully. Check your email for the tracking link."
        ]);
        exit;
    }

    /* ── AUTHENTICATED ACTIONS (Agents/Admins) ──────────────────── */
    $headers = getAuthHeaders();
    $auth = decodeJwt($headers);
    if (!$auth) exit(json_encode(["error" => "Unauthorized"]));

    $userId = $auth['id'];
    $tenantId = $auth['tenant_id'];

    if ($action === 'list') {
        $stmt = $pdo->prepare("
            SELECT t.*, l.visitor_uid, l.chat_status,
                   (SELECT message FROM ticket_replies WHERE ticket_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message
            FROM tickets t
            JOIN leads l ON t.lead_id = l.id
            WHERE t.tenant_id = ?
            ORDER BY t.created_at DESC
        ");
        $stmt->execute([$tenantId]);
        echo json_encode($stmt->fetchAll());
    }

    if ($action === 'reply' || $action === 'create_reply_public') {
        $message   = $data['message'];
        $isPrivate = $data['is_private'] ?? 0;
        $ticketId  = $data['ticket_id'] ?? null;
        $trackingId = $data['tracking_id'] ?? null;

        if ($trackingId) {
            $stmt = $pdo->prepare("SELECT id FROM tickets WHERE tracking_id = ?");
            $stmt->execute([$trackingId]);
            $ticket = $stmt->fetch();
            if (!$ticket) exit(json_encode(["error" => "Ticket not found"]));
            $ticketId = $ticket['id'];
            $userId = null; // Public visitor reply
            $isPrivate = 0;
        } else {
            // Auth check for internal reply
            $headers = getAuthHeaders();
            $auth = decodeJwt($headers);
            if (!$auth) exit(json_encode(["error" => "Unauthorized"]));
            $userId = $auth['id'];
            $tenantId = $auth['tenant_id'];

            // Verify ownership
            $stmt = $pdo->prepare("SELECT id FROM tickets WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$ticketId, $tenantId]);
            if (!$stmt->fetch()) exit(json_encode(["error" => "Ticket not found"]));
        }

        $stmt = $pdo->prepare("INSERT INTO ticket_replies (ticket_id, user_id, message, is_private) VALUES (?, ?, ?, ?)");
        $stmt->execute([$ticketId, $userId, $message, $isPrivate]);

        if ($trackingId) {
            // Visitor replied -> Notify Agent/Tenant
            $stmt = $pdo->prepare("SELECT tenant_id, tracking_id FROM tickets WHERE id = ?");
            $stmt->execute([$ticketId]);
            $tDetails = $stmt->fetch();
            if ($tDetails) {
                triggerNotification($tDetails['tenant_id'], 'ticket_reply', 'New Ticket Reply', "Visitor replied to Ticket #{$tDetails['tracking_id']}", "/dashboard/tickets");
            }
        } else {
            // Agent replied -> Notify Visitor if public reply (isPrivate == 0)
            if ((int)$isPrivate === 0) {
                $stmt = $pdo->prepare("SELECT l.session_id, t.tracking_id FROM tickets t JOIN leads l ON t.lead_id = l.id WHERE t.id = ?");
                $stmt->execute([$ticketId]);
                $tLead = $stmt->fetch();
                if ($tLead) {
                    $payload = json_encode([
                        'sessionId' => $tLead['session_id'],
                        'type' => 'ticket_reply',
                        'data' => [
                            'ticketId' => $ticketId,
                            'trackingId' => $tLead['tracking_id'],
                            'message' => $message
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
        }

        echo json_encode(["success" => true]);
        exit;
    }

    if ($action === 'convert_lead') {
        $leadId     = $data['leadId'];
        $subject    = $data['subject'] ?? 'Chat Escalation';
        $message    = $data['message'] ?? 'Escalated from live chat.';
        $priority   = $data['priority'] ?? 'medium';
        $department = $data['department'] ?? 'Support';
        $email      = $data['email'] ?? '';

        // 1. Verify lead exists and belongs to tenant
        $stmt = $pdo->prepare("SELECT id FROM leads WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$leadId, $tenantId]);
        if (!$stmt->fetch()) exit(json_encode(["error" => "Lead not found"]));

        // 2. Create Ticket
        $trackingId = generateTrackingId();
        $stmt = $pdo->prepare("INSERT INTO tickets (tenant_id, lead_id, tracking_id, subject, status, priority, department) VALUES (?, ?, ?, ?, 'open', ?, ?)");
        $stmt->execute([$tenantId, $leadId, $trackingId, $subject, $priority, $department]);
        $ticketId = $pdo->lastInsertId();

        // 3. Add Initial Message
        $stmt = $pdo->prepare("INSERT INTO ticket_replies (ticket_id, user_id, message) VALUES (?, ?, ?)");
        $stmt->execute([$ticketId, $userId, $message]);

        // 4. Update lead status
        $pdo->prepare("UPDATE leads SET chat_status = 'ticket' WHERE id = ?")->execute([$leadId]);

        // 5. Create Notification for the tenant
        triggerNotification($tenantId, 'ticket', 'Chat Escalated', "Chat #$leadId was converted to Ticket #$trackingId", "/dashboard/tickets");

        // 6. Send Mail to Visitor if email exists
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

        echo json_encode(["success" => true, "tracking_id" => $trackingId]);
        exit;
    }

    if ($action === 'create_internal') {
        $subject = $data['subject'] ?? 'Internal Support Ticket';
        $message = $data['message'] ?? '';
        $visitorEmail = $data['email'] ?? 'unknown@example.com';
        
        // Find or create website (fallback)
        $stmt = $pdo->prepare("SELECT id FROM websites WHERE tenant_id = ? LIMIT 1");
        $stmt->execute([$tenantId]);
        $websiteId = $stmt->fetchColumn();

        if (!$websiteId) exit(json_encode(["error" => "No website found to attach lead to."]));

        // Create a mock lead for this ticket
        $uid = "V-" . strtoupper(substr(md5(uniqid()), 0, 5));
        $stmt = $pdo->prepare("INSERT INTO leads (tenant_id, website_id, session_id, visitor_uid, chat_status, details) VALUES (?, ?, ?, ?, 'ticket', ?)");
        $stmt->execute([$tenantId, $websiteId, uniqid(), $uid, json_encode(['email' => $visitorEmail])]);
        $leadId = $pdo->lastInsertId();

        // Create Ticket
        $trackingId = generateTrackingId();
        $stmt = $pdo->prepare("INSERT INTO tickets (tenant_id, lead_id, tracking_id, subject, status) VALUES (?, ?, ?, ?, 'open')");
        $stmt->execute([$tenantId, $leadId, $trackingId, $subject]);
        $ticketId = $pdo->lastInsertId();

        // Add Initial Message
        $stmt = $pdo->prepare("INSERT INTO ticket_replies (ticket_id, user_id, message) VALUES (?, ?, ?)");
        $stmt->execute([$ticketId, $userId, $message]);

        // Trigger Notification
        triggerNotification($tenantId, 'new_ticket', 'New Internal Ticket Raised', "Ticket #$trackingId: $subject", "/dashboard/tickets");

        // Send Notification
        require_once 'mail_service.php';
        $mail = new MailService($pdo);
        $trackingLink = getFrontendBaseUrl() . "/ticket/" . $trackingId;
        $mail->queue($visitorEmail, 'ticket_created', [
            'subject' => $subject,
            'tracking_id' => $trackingId,
            'tracking_link' => $trackingLink
        ]);

        echo json_encode(["success" => true, "tracking_id" => $trackingId]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
