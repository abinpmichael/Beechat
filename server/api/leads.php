<?php
// server/api/leads.php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

/* ── POST: widget submits a new lead ──────────────────────── */
if ($method === 'POST') {
    $data      = json_decode(file_get_contents("php://input"), true) ?? [];
    $apiKey    = $data['apiKey']    ?? '';
    $phone     = $data['phone']     ?? '';
    $details   = $data['details']   ?? [];
    $sessionId = $data['sessionId'] ?? '';

    try {
        $stmt = $pdo->prepare("SELECT id, tenant_id FROM websites WHERE api_key=?");
        $stmt->execute([$apiKey]);
        $site = $stmt->fetch();

        if (!$site) { http_response_code(404); echo json_encode(["error"=>"Site not found"]); exit; }

        $isLive  = (isset($details['status']) && $details['status'] === 'human_requested') ? 1 : 0;
        $status  = $isLive ? 'waiting' : 'lead';

        // ── DUPLICATE PROTECTION: Check for existing active lead ──
        $stmt = $pdo->prepare("SELECT id, visitor_uid FROM leads WHERE session_id = ? AND website_id = ? AND chat_status != 'ended' LIMIT 1");
        $stmt->execute([$sessionId, $site['id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update existing instead of creating new
            $stmt = $pdo->prepare("UPDATE leads SET is_live = ?, chat_status = ?, last_seen_at = NOW() WHERE id = ?");
            $stmt->execute([$isLive, $status, $existing['id']]);
            $leadId = $existing['id'];
            $uid    = $existing['visitor_uid'];
            $msg    = "Session resumed";
        } else {
            // Generate a human-friendly visitor UID
            $uid = 'BEE-' . strtoupper(substr(md5($sessionId . microtime()), 0, 6));

            $stmt = $pdo->prepare("INSERT INTO leads (tenant_id,website_id,session_id,phone,details,is_live,chat_status,visitor_uid) VALUES (?,?,?,?,?,?,?,?)");
            $stmt->execute([$site['tenant_id'], $site['id'], $sessionId, $phone, json_encode($details), $isLive, $status, $uid]);
            $leadId = $pdo->lastInsertId();
            $msg    = "Lead captured";
        }

        // If live requested, log system message
        if ($isLive) {
            $pdo->prepare("INSERT INTO messages (lead_id,sender_type,content,agent_name) VALUES (?,'agent',?,'System')")
                ->execute([$leadId, "🟡 Visitor $uid is active."]);
        }

        // Queue Ticket Confirmation if it's a lead (and has email)
        if (isset($details['email']) && !empty($details['email'])) {
            try {
                require_once 'mail_service.php';
                $mail = new MailService($pdo);
                $mail->queue($details['email'], 'ticket_received', [
                    'ticket_id' => $leadId,
                    'subject' => $details['subject'] ?? 'Support Request',
                    'tracking_url' => "http://localhost:5173/ticket/" . base64_encode($leadId)
                ]);
            } catch (Exception $e) { }
        }

        echo json_encode(["message"=>$msg,"id"=>$leadId,"uid"=>$uid]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

/* ── GET: Check Session (for Widget) ──────────────────────── */
if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'check_session') {
    $sessionId = $_GET['sessionId'] ?? '';
    $apiKey    = $_GET['apiKey']    ?? '';
    try {
        $stmt = $pdo->prepare("
            SELECT l.id, l.is_live, l.chat_status
            FROM leads l
            JOIN websites w ON l.website_id = w.id
            WHERE l.session_id = ? AND w.api_key = ?
            ORDER BY l.created_at DESC LIMIT 1
        ");
        $stmt->execute([$sessionId, $apiKey]);
        $lead = $stmt->fetch();
        echo json_encode($lead ?: (object)[]);
    } catch (Exception $e) {
        http_response_code(500); echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

$headers = getAuthHeaders();
$decoded = decodeJwt($headers);

if (!$decoded || !isset($decoded['tenant_id'])) {
    http_response_code(401);
    exit;
}
$tenantId = (int)$decoded['tenant_id'];

/* ── DELETE ────────────────────────────────────────────────── */
if ($method === 'DELETE') {
    $leadId = (int)($_GET['id'] ?? 0);
    try {
        $pdo->prepare("DELETE FROM leads WHERE id=? AND tenant_id=?")->execute([$leadId, $tenantId]);
        echo json_encode(["message"=>"Lead deleted"]);
    } catch (Exception $e) {
        http_response_code(500); echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

/* ── GET: list leads ──────────────────────────────────────── */
try {
    // 0. Fetch Visibility Setting
    $stmt = $pdo->prepare("SELECT chat_visibility FROM tenant_settings WHERE tenant_id = ?");
    $stmt->execute([$tenantId]);
    $vSet = $stmt->fetch();
    $visibility = $vSet['chat_visibility'] ?? 'shared';

    // Auto-expire leads with no heartbeat for >60 seconds
    $pdo->prepare("
        UPDATE leads
        SET is_live = 0, chat_status = 'ended'
        WHERE is_live = 1
          AND chat_status NOT IN ('ended','transferred')
          AND last_seen_at IS NOT NULL
          AND last_seen_at < DATE_SUB(NOW(), INTERVAL 60 SECOND)
    ")->execute();

    $isSuper = (int)($decoded['is_superadmin'] ?? 0) === 1;

    $filter = $_GET['filter'] ?? 'all'; // all | live | history
    $sql = "SELECT l.*, w.domain, t.name as tenant_name,
               COALESCE(l.visitor_uid, CONCAT('BEE-', UPPER(SUBSTR(MD5(l.id),1,6)))) AS visitor_uid
            FROM leads l
            JOIN websites w ON l.website_id = w.id
            JOIN tenants t ON l.tenant_id = t.id
            WHERE 1=1";

    $params = [];
    if (!$isSuper) {
        $sql .= " AND l.tenant_id = ?";
        $params[] = $tenantId;
    }

    // Apply Privacy Visibility (only for agents, admins see everything)
    if (!$isSuper && $visibility === 'private' && $decoded['role'] !== 'admin') {
        $sql .= " AND (l.assigned_to = ? OR l.assigned_to IS NULL)";
        $params[] = (int)$decoded['id'];
    }

    if ($filter === 'live')    $sql .= " AND (l.chat_status NOT IN ('ended','transferred') OR l.last_seen_at > DATE_SUB(NOW(), INTERVAL 60 SECOND))";
    if ($filter === 'history') $sql .= " AND (l.chat_status='ended' OR l.chat_status='transferred') AND l.last_seen_at < DATE_SUB(NOW(), INTERVAL 60 SECOND)";

    $sql .= " ORDER BY l.created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error"=>$e->getMessage()]);
}
?>
