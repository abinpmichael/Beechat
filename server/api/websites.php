<?php
// server/api/websites.php
require_once 'config.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$token = $matches[1];
$decoded = json_decode(base64_decode($token), true);
$tenantId = $decoded['tenant_id'];

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM websites WHERE tenant_id = ?");
        $stmt->execute([$tenantId]);
        echo json_encode($stmt->fetchAll());
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($_GET['action']) && $_GET['action'] === 'toggle_ai') {
            $id = $data['id'] ?? 0;
            $enabled = $data['enabled'] ? 1 : 0;
            $stmt = $pdo->prepare("UPDATE websites SET ai_enabled = ? WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$enabled, $id, $tenantId]);
            echo json_encode(["message" => "AI status updated"]);
            exit;
        }

        if (isset($_GET['action']) && $_GET['action'] === 'update_branding') {
            $id = $data['id'] ?? 0;
            $botName = $data['bot_name'] ?? 'Bee Bot';
            $botImage = $data['bot_image'] ?? '';
            $themeColor = $data['theme_color'] ?? '#6366f1';
            $welcomeMessage = $data['welcome_message'] ?? 'Hello! How can we help you today?';
            $botSubtitle = $data['bot_subtitle'] ?? 'Support Assistant';
            $successMessage = $data['success_message'] ?? 'Thank you! We will be in touch soon.';
            $surveyConfig = json_encode($data['survey_config'] ?? []);
            $formConfig   = json_encode($data['form_config'] ?? []);
            
            $headerBg = $data['header_bg_gradient'] ?? null;
            $sound    = $data['notification_sound'] ?? null;
            $icon     = $data['widget_icon'] ?? null;
            
            $stmt = $pdo->prepare("UPDATE websites SET 
                bot_name = ?, bot_image = ?, theme_color = ?, 
                welcome_message = ?, bot_subtitle = ?, success_message = ?, 
                survey_config = ?, form_config = ?, header_bg_gradient = ?, 
                notification_sound = ?, widget_icon = ? 
                WHERE id = ? AND tenant_id = ?");
            $stmt->execute([
                $botName, $botImage, $themeColor, $welcomeMessage, $botSubtitle, $successMessage, 
                $surveyConfig, $formConfig, $headerBg, $sound, $icon, $id, $tenantId
            ]);
            
            echo json_encode(["message" => "Settings updated"]);
            exit;
        }

        $domain = $data['domain'] ?? '';
        
        // --- Improved Plan Limit Check ---
        // 1. Get current website count
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM websites WHERE tenant_id = ?");
        $countStmt->execute([$tenantId]);
        $currentCount = $countStmt->fetchColumn();

        // 2. Get plan limit
        $planStmt = $pdo->prepare("
            SELECT p.max_websites 
            FROM tenants t 
            JOIN plans p ON t.plan_id = p.id 
            WHERE t.id = ?
        ");
        $planStmt->execute([$tenantId]);
        $maxWebsites = $planStmt->fetchColumn() ?: 1; // Default to 1 if no plan found

        if ($currentCount >= $maxWebsites) {
            http_response_code(403);
            echo json_encode(["message" => "Plan limit reached ($maxWebsites). Please upgrade to add more websites."]);
            exit;
        }
        // -------------------------

        $apiKey = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("INSERT INTO websites (tenant_id, domain, api_key, settings) VALUES (?, ?, ?, ?)");
        $stmt->execute([$tenantId, $domain, $apiKey, json_encode(['theme' => 'default'])]);
        
        echo json_encode([
            "message" => "Website added successfully",
            "website" => ["domain" => $domain, "api_key" => $apiKey]
        ]);
    } 
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? 0;
        $stmt = $pdo->prepare("DELETE FROM websites WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$id, $tenantId]);
        echo json_encode(["message" => "Website deleted"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
