<?php
// server/api/stats.php — real dashboard stats
require_once 'config.php';

$headers    = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $m)) {
    http_response_code(401); echo json_encode(["error"=>"Unauthorized"]); exit;
}
$decoded  = json_decode(base64_decode($m[1]), true);
$tenantId = (int)($decoded['tenant_id'] ?? 0);

try {
    // Auto-expire ghosts (no heartbeat >60s)
    $pdo->prepare("
        UPDATE leads
        SET is_live = 0, chat_status = 'ended'
        WHERE is_live = 1
          AND chat_status NOT IN ('ended','transferred')
          AND last_seen_at IS NOT NULL
          AND last_seen_at < DATE_SUB(NOW(), INTERVAL 60 SECOND)
    ")->execute();

    // Live conversations right now
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM leads WHERE tenant_id=? AND is_live=1 AND chat_status NOT IN ('ended','transferred')");
    $stmt->execute([$tenantId]); $liveChats = (int)$stmt->fetchColumn();

    // Total leads ever
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM leads WHERE tenant_id=?");
    $stmt->execute([$tenantId]); $totalLeads = (int)$stmt->fetchColumn();

    // Waiting for human agent
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM leads WHERE tenant_id=? AND is_live=1 AND chat_status NOT IN ('ended','transferred') AND (assigned_to IS NULL OR chat_status='waiting')");
    $stmt->execute([$tenantId]); $waiting = (int)$stmt->fetchColumn();

    // Total messages (activity)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM messages m JOIN leads l ON m.lead_id=l.id WHERE l.tenant_id=?");
    $stmt->execute([$tenantId]); $totalMessages = (int)$stmt->fetchColumn();

    // Websites count
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM websites WHERE tenant_id=?");
    $stmt->execute([$tenantId]); $websites = (int)$stmt->fetchColumn();

    // Agents count
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE tenant_id=?");
    $stmt->execute([$tenantId]); $agents = (int)$stmt->fetchColumn();

    // Ended today
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM leads WHERE tenant_id=? AND chat_status='ended' AND DATE(created_at)=CURDATE()");
    $stmt->execute([$tenantId]); $endedToday = (int)$stmt->fetchColumn();

    // Recent live leads (last 5)
    $stmt = $pdo->prepare("SELECT l.id, l.visitor_uid, l.phone, l.chat_status, l.is_live, l.assigned_to, l.created_at, l.last_seen_at, w.domain
        FROM leads l JOIN websites w ON l.website_id=w.id
        WHERE l.tenant_id=? AND l.is_live=1 AND l.chat_status NOT IN ('ended','transferred')
        ORDER BY l.created_at DESC LIMIT 5");
    $stmt->execute([$tenantId]); $recentLive = $stmt->fetchAll();

    // Recent agents
    $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE tenant_id=? ORDER BY created_at DESC LIMIT 6");
    $stmt->execute([$tenantId]); $agentList = $stmt->fetchAll();

    // Online Now (visitors with any heartbeat in the last 60s)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM leads WHERE tenant_id=? AND last_seen_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)");
    $stmt->execute([$tenantId]); $onlineNow = (int)$stmt->fetchColumn();

    // Daily Stats for the Graph (Last 7 Days)
    $stmt = $pdo->prepare("
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM leads 
        WHERE tenant_id=? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $stmt->execute([$tenantId]);
    $dailyRaw = $stmt->fetchAll();
    
    // Fill gaps for 7 days
    $dailyStats = [];
    for ($i = 6; $i >= 0; $i--) {
        $d = date('Y-m-d', strtotime("-$i days"));
        $found = 0;
        foreach ($dailyRaw as $row) { if ($row['date'] === $d) $found = (int)$row['count']; }
        $dailyStats[] = ["date" => date('D', strtotime($d)), "count" => $found];
    }

    echo json_encode([
        "live_chats"     => $liveChats,
        "total_leads"    => $totalLeads,
        "online_now"     => $onlineNow,
        "waiting"        => $waiting,
        "total_messages" => $totalMessages,
        "websites"       => $websites,
        "agents"         => $agents,
        "ended_today"    => $endedToday,
        "recent_live"    => $recentLive,
        "agent_list"     => $agentList,
        "daily_stats"    => $dailyStats,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
