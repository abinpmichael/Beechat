<?php
// server/api/chat.php  — stores ALL messages for audit/history
require_once 'config.php';

$data      = json_decode(file_get_contents("php://input"), true) ?? [];
$apiKey    = $data['apiKey']    ?? $_GET['apiKey']    ?? '';
$message   = trim($data['message']   ?? '');
$sessionId = $data['sessionId'] ?? '';

if (empty($apiKey)) {
    http_response_code(400);
    echo json_encode(["error" => "API Key required"]);
    exit;
}

/* ── GET BRANDING & HOURS ──────────────────────────────────── */
if (isset($_GET['action']) && $_GET['action'] === 'get_branding') {
    try {
        $stmt = $pdo->prepare("
            SELECT w.*, s.opening_time, s.closing_time, s.timezone, t.status as tenant_status, p.name as plan_name
            FROM websites w 
            LEFT JOIN tenant_settings s ON w.tenant_id = s.tenant_id 
            JOIN tenants t ON w.tenant_id = t.id
            LEFT JOIN plans p ON t.plan_id = p.id
            WHERE w.api_key = ?
        ");
        $stmt->execute([$_GET['apiKey']]);
        $res = $stmt->fetch();
        
        if ($res && $res['tenant_status'] === 'suspended') {
            echo json_encode(["error" => "Account Suspended. Please contact support."]);
            exit;
        }
        
        if (!$res) {
            echo json_encode(["error" => "Website not found"]);
        } else {
            // Check if open based on TENANT TIMEZONE
            $timezone = $res['timezone'] ?? 'UTC';
            $dateTime = new DateTime("now", new DateTimeZone($timezone));
            $now = $dateTime->format('H:i:s');
            
            $open   = $res['opening_time'] ?? '00:00:00';
            $close  = $res['closing_time'] ?? '23:59:59';
            $isOpen = ($now >= $open && $now <= $close);
            
            $res['is_open'] = $isOpen;
            echo json_encode($res);
        }
    } catch (Exception $e) {
        // Fallback
        echo json_encode([
            "bot_name" => "Bee Bot", "theme_color" => "#6366f1",
            "is_open" => true, "welcome_message" => "Hello! How can we help?"
        ]);
    }
    exit;
}

if (empty($message)) { http_response_code(400); exit; }

try {
    // 1. Verify website
    $stmt = $pdo->prepare("SELECT id, tenant_id, ai_enabled FROM websites WHERE api_key=?");
    $stmt->execute([$apiKey]);
    $website = $stmt->fetch();
    if (!$website) { http_response_code(404); exit; }

    // 2. Find or CREATE lead so offline messages show in dashboard
    $leadId = null;
    if ($sessionId) {
        $stmt = $pdo->prepare("SELECT id FROM leads WHERE session_id=? AND website_id=?");
        $stmt->execute([$sessionId, $website['id']]);
        $lead = $stmt->fetch();
        
        if ($lead) {
            $leadId = $lead['id'];
        } else {
            // Create a lead automatically so it shows up in dashboard immediately
            $uid = "V-" . strtoupper(substr(md5($sessionId), 0, 5));
            $stmt = $pdo->prepare("INSERT INTO leads (tenant_id, website_id, session_id, visitor_uid, chat_status) VALUES (?, ?, ?, ?, 'lead')");
            $stmt->execute([$website['tenant_id'], $website['id'], $sessionId, $uid]);
            $leadId = $pdo->lastInsertId();
        }
    }

    // 3. Save visitor message
    if ($leadId) {
        $pdo->prepare("INSERT INTO messages (lead_id,sender_type,content) VALUES (?,?,?)")
            ->execute([$leadId, 'visitor', $message]);
        
        // --- AI & AUTOMATION INTEGRATION ---
        $stmt = $pdo->prepare("SELECT ai_auto_reply FROM tenant_settings WHERE tenant_id = ?");
        $stmt->execute([$website['tenant_id']]);
        $settings = $stmt->fetch();

        if ($settings && $settings['ai_auto_reply'] == 1) {
            require_once 'ai_engine.php';
            $ai = new AIEngine($pdo);
            $aiResponse = $ai->getResponse($website['tenant_id'], $website['id'], $message);

            if ($aiResponse) {
                $pdo->prepare("INSERT INTO messages (lead_id, sender_type, content, agent_name) VALUES (?, 'agent', ?, 'AI')")
                    ->execute([$leadId, "[AI]: " . $aiResponse]);
                
                echo json_encode([
                    "sender_type" => "bot", 
                    "content" => $aiResponse, 
                    "lead_id" => $leadId,
                    "created_at" => date('Y-m-d H:i:s')
                ]);
                exit;
            }
        }
    }

    // 4. Generate bot response (Check if offline for tailored response)
    $isOffline = $data['isOffline'] ?? false;
    
    if ($isOffline) {
        $botReply = "Thanks for your message! Our team is currently away, but we've received your inquiry and will get back to you as soon as we're back online.";
    } else {
        $responses = [
            "That's a great question! Our team is here to assist you.",
            "I've noted your inquiry. A specialist will be with you shortly.",
            "Happy to help! Could you share a few more details?",
            "Our team has been notified and will respond as soon as possible!"
        ];
        $botReply = $responses[array_rand($responses)];
    }

    // 5. Save bot response
    if ($leadId) {
        $pdo->prepare("INSERT INTO messages (lead_id,sender_type,content,agent_name) VALUES (?,?,?,?)")
            ->execute([$leadId, 'agent', $botReply, 'Bot']);
    }

    echo json_encode([
        "sender_type" => "bot", 
        "content" => $botReply, 
        "lead_id" => $leadId,
        "created_at" => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
