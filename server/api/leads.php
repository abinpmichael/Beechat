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

        // Parse user agent
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $browser = 'Chrome';
        if (strpos($userAgent, 'Firefox') !== false) $browser = 'Firefox';
        else if (strpos($userAgent, 'Safari') !== false && strpos($userAgent, 'Chrome') === false) $browser = 'Safari';
        else if (strpos($userAgent, 'Edge') !== false) $browser = 'Edge';

        $device = 'Desktop';
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $userAgent)) {
            $device = 'Tablet';
        } else if (preg_match('/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Opera Mini/i', $userAgent)) {
            $device = 'Mobile';
        }

        // Look up IP and country
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if ($ip === '::1' || $ip === '127.0.0.1') {
            $ip = '104.244.42.1'; // Twitter IP for lookup
        }
        $country = 'United States';
        $ctx = stream_context_create(['http' => ['timeout' => 2]]);
        $geoJson = @file_get_contents("http://ip-api.com/json/" . $ip, false, $ctx);
        if ($geoJson) {
            $geoData = json_decode($geoJson, true);
            if (isset($geoData['country']) && !empty($geoData['country'])) {
                $country = $geoData['country'];
            }
        }

        // ── DUPLICATE PROTECTION: Check for existing active lead ──
        $stmt = $pdo->prepare("SELECT id, visitor_uid FROM leads WHERE session_id = ? AND website_id = ? AND chat_status != 'ended' LIMIT 1");
        $stmt->execute([$sessionId, $site['id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Fetch existing details first
            $stmt = $pdo->prepare("SELECT details, phone FROM leads WHERE id = ?");
            $stmt->execute([$existing['id']]);
            $existingLead = $stmt->fetch();
            $existingDetails = [];
            if ($existingLead && !empty($existingLead['details'])) {
                $existingDetails = json_decode($existingLead['details'], true) ?? [];
            }
            
            // Merge existing details with incoming details
            $mergedDetails = array_merge($existingDetails, $details);
            
            // Check if phone was submitted in the new details or as a direct parameter
            $phoneToUpdate = $phone;
            if (empty($phoneToUpdate) && isset($mergedDetails['phone'])) {
                $phoneToUpdate = $mergedDetails['phone'];
            }
            if (empty($phoneToUpdate) && $existingLead) {
                $phoneToUpdate = $existingLead['phone'];
            }

            // Update existing instead of creating new
            $stmt = $pdo->prepare("UPDATE leads SET is_live = ?, chat_status = ?, last_seen_at = NOW(), country = ?, browser = ?, device = ?, details = ?, phone = ? WHERE id = ?");
            $stmt->execute([$isLive, $status, $country, $browser, $device, json_encode($mergedDetails), $phoneToUpdate, $existing['id']]);
            $leadId = $existing['id'];
            $uid    = $existing['visitor_uid'];
            $msg    = "Session resumed & details updated";
        } else {
            // Generate a human-friendly visitor UID
            $uid = 'BEE-' . strtoupper(substr(md5($sessionId . microtime()), 0, 6));

            $stmt = $pdo->prepare("INSERT INTO leads (tenant_id,website_id,session_id,phone,details,is_live,chat_status,visitor_uid,country,browser,device) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
            $stmt->execute([$site['tenant_id'], $site['id'], $sessionId, $phone, json_encode($details), $isLive, $status, $uid, $country, $browser, $device]);
            $leadId = $pdo->lastInsertId();
            $msg    = "Lead captured";
        }

        // If live requested, log system message
        if ($isLive) {
            $pdo->prepare("INSERT INTO messages (lead_id,sender_type,content,agent_name) VALUES (?,'agent',?,'System')")
                ->execute([$leadId, "🟡 Visitor $uid is active."]);

            // Notify tenant dashboard about waiting visitor
            triggerNotification($site['tenant_id'], 'visitor_waiting', 'Visitor Requesting Human Agent', "Visitor $uid is waiting for an agent to claim the chat.", "/dashboard/leads");
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
            SELECT l.id, l.is_live, l.chat_status, l.assigned_to, u.name AS agent_name
            FROM leads l
            JOIN websites w ON l.website_id = w.id
            LEFT JOIN users u ON l.assigned_to = u.id
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
