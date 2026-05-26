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
        // Dynamic column check to ensure websites schema matches code expectations
        try {
            $colsToCheck = [
                'survey_priority' => 'INT DEFAULT 1',
                'survey_config' => 'LONGTEXT',
                'form_config' => 'LONGTEXT',
                'header_bg_gradient' => 'VARCHAR(255)',
                'notification_sound' => 'TEXT',
                'widget_icon' => 'TEXT'
            ];
            foreach ($colsToCheck as $colName => $colDef) {
                $cols = $pdo->query("SHOW COLUMNS FROM websites LIKE '$colName'")->fetchAll();
                if (empty($cols)) {
                    $pdo->exec("ALTER TABLE websites ADD COLUMN $colName $colDef");
                }
            }
        } catch (Exception $schemaEx) {
            error_log("Websites schema check failed in chat.php: " . $schemaEx->getMessage());
        }

        $stmt = $pdo->prepare("
            SELECT w.*, s.opening_time, s.closing_time, s.timezone, t.status as tenant_status, t.is_active, p.name as plan_name
            FROM websites w 
            LEFT JOIN tenant_settings s ON w.tenant_id = s.tenant_id 
            JOIN tenants t ON w.tenant_id = t.id
            LEFT JOIN plans p ON t.plan_id = p.id
            WHERE w.api_key = ?
        ");
        $stmt->execute([$_GET['apiKey']]);
        $res = $stmt->fetch();
        
        if ($res && ($res['tenant_status'] === 'suspended' || (isset($res['is_active']) && (int)$res['is_active'] === 0))) {
            echo json_encode(["error" => "Account Suspended. Please contact support."]);
            exit;
        }
        
        if (!$res) {
            echo json_encode(["error" => "Website not found"]);
        } else {
            // Check if open based on TENANT TIMEZONE
            $timezone = !empty($res['timezone']) ? $res['timezone'] : 'UTC';
            try {
                $tz = new DateTimeZone($timezone);
            } catch (Exception $tzEx) {
                $timezone = 'UTC';
                $tz = new DateTimeZone('UTC');
            }
            $dateTime = new DateTime("now", $tz);
            $now = $dateTime->format('H:i:s');
            
            $open   = !empty($res['opening_time']) ? $res['opening_time'] : '00:00:00';
            $close  = !empty($res['closing_time']) ? $res['closing_time'] : '23:59:59';
            
            if ($open <= $close) {
                $isOpen = ($now >= $open && $now <= $close);
            } else {
                // Spans midnight (e.g. 22:00:00 to 06:00:00)
                $isOpen = ($now >= $open || $now <= $close);
            }
            
            $res['is_open'] = $isOpen;

            // IP Country Lookup for Colony Pulse
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            if ($ip === '::1' || $ip === '127.0.0.1') {
                $ip = '104.244.42.1'; // fallback public IP
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
            $res['country'] = $country;

            // GLOBAL SETTINGS
            $gStmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN ('enable_live_chat', 'enable_ai_bot', 'enable_ticketing')");
            foreach ($gStmt->fetchAll() as $row) {
                $res[$row['setting_key']] = (int)$row['setting_value'];
            }

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
        
        // --- AI & AUTOMATION INTEGRATION (CognitioIT Rules) ---
        $stmt = $pdo->prepare("SELECT ai_auto_reply, ai_offline_only FROM tenant_settings WHERE tenant_id = ?");
        $stmt->execute([$website['tenant_id']]);
        $settings = $stmt->fetch();

        // Check if ANY agent is online (last_seen_at < 60s ago)
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE tenant_id = ? AND last_seen_at > (NOW() - INTERVAL 1 MINUTE)");
        $stmt->execute([$website['tenant_id']]);
        $agentsOnline = $stmt->fetchColumn() > 0;

        // Check GLOBAL AI toggle first
        $globalAi = $pdo->query("SELECT setting_value FROM platform_settings WHERE setting_key = 'enable_ai_bot'")->fetchColumn();

        $aiAutoReply = isset($settings['ai_auto_reply']) ? (int)$settings['ai_auto_reply'] : 1;
        $shouldTriggerAI = ($globalAi == '1' && $aiAutoReply === 1 && isset($website['ai_enabled']) && (int)$website['ai_enabled'] === 1);
        
        // Apply "Offline Only" rule: If agents are online and "offline only" is active, skip AI.
        if ($shouldTriggerAI && $agentsOnline && ($settings['ai_offline_only'] ?? 1) == 1) {
            $shouldTriggerAI = false;
        }

        if ($shouldTriggerAI) {
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
                    "created_at" => date('Y-m-d H:i:s'),
                    "ai_mode" => true
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
