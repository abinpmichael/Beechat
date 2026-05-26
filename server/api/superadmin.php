<?php
// server/api/superadmin.php
require_once 'config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// PUBLIC ACTIONS
if ($method === 'GET' && ($_GET['action'] ?? '') === 'get_plans') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM plans");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
        exit;
    }
}

$headers = getAuthHeaders();
$auth = decodeJwt($headers);

if (!$auth) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized access"]);
    exit;
}

// ONLY SUPERADMINS ALLOWED
if (($auth['is_superadmin'] ?? 0) !== 1) {
    http_response_code(403);
    echo json_encode(["message" => "Forbidden: SuperAdmin access only"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list_tenants';

        if ($action === 'list_tenants') {
            // Auto-check expired dates and suspend any expired accounts (except System tenant #1)
            $pdo->exec("UPDATE tenants SET is_active = 0 WHERE expires_at IS NOT NULL AND expires_at < NOW() AND id != 1");

            $stmt = $pdo->prepare("
                SELECT t.*, p.name as plan_name, 
                       (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as user_count,
                       (SELECT COUNT(*) FROM websites WHERE tenant_id = t.id) as site_count,
                       COALESCE(
                           (SELECT name FROM users WHERE tenant_id = t.id AND role = 'admin' LIMIT 1),
                           (SELECT name FROM users WHERE tenant_id = t.id LIMIT 1)
                       ) as owner_name,
                       COALESCE(
                           (SELECT email FROM users WHERE tenant_id = t.id AND role = 'admin' LIMIT 1),
                           (SELECT email FROM users WHERE tenant_id = t.id LIMIT 1)
                       ) as owner_email
                FROM tenants t
                LEFT JOIN plans p ON t.plan_id = p.id
                ORDER BY t.created_at DESC
            ");
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
            exit;
        }
        
        if ($action === 'get_plans') {
            $stmt = $pdo->prepare("SELECT * FROM plans");
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
        }
        if ($action === 'get_platform_settings') {
            $stmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings");
            $settings = [];
            foreach ($stmt->fetchAll() as $row) {
                $val = $row['setting_value'];
                if ($row['setting_key'] === 'is_testing_mode') $val = (int)$val;
                $settings[$row['setting_key']] = $val;
            }
            // Defaults
            if (!isset($settings['is_testing_mode'])) $settings['is_testing_mode'] = 1;
            if (!isset($settings['platform_name'])) $settings['platform_name'] = 'Bee Chat';
            
            echo json_encode($settings);
            exit;
        }

        if ($action === 'list_all_knowledge') {
            $stmt = $pdo->query("SELECT k.*, COALESCE(w.domain, 'PLATFORM') as domain, COALESCE(t.name, 'GLOBAL') as tenant_name 
                                FROM knowledge_base k
                                LEFT JOIN websites w ON k.website_id = w.id
                                LEFT JOIN tenants t ON k.tenant_id = t.id
                                ORDER BY k.created_at DESC");
            echo json_encode($stmt->fetchAll());
            exit;
        }

        if ($action === 'list_email_templates') {
            $stmt = $pdo->query("SELECT * FROM email_templates ORDER BY name ASC");
            echo json_encode($stmt->fetchAll());
            exit;
        }

        if ($action === 'get_revenue_stats') {
            // Total Revenue
            $total = $pdo->query("SELECT SUM(amount) FROM subscriptions_ledger")->fetchColumn() ?? 0;
            
            // Monthly Breakdown
            $monthly = $pdo->query("
                SELECT 
                    YEAR(created_at) as year, 
                    MONTH(created_at) as month, 
                    SUM(amount) as total 
                FROM subscriptions_ledger 
                GROUP BY YEAR(created_at), MONTH(created_at) 
                ORDER BY year DESC, month DESC
            ")->fetchAll();

            echo json_encode([
                "total_revenue" => $total,
                "monthly_stats" => $monthly
            ]);
            exit;
        }
        exit;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        if ($action === 'update_plan') {
            $tenantId = $data['tenant_id'];
            $planId   = $data['plan_id'];
            $expiresAt = !empty($data['expires_at']) ? $data['expires_at'] . " 23:59:59" : null;
            $isActive  = (int)($data['is_active'] ?? 1);

            $stmt = $pdo->prepare("UPDATE tenants SET plan_id = ?, expires_at = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$planId, $expiresAt, $isActive, $tenantId]);
            
            echo json_encode(["message" => "Tenant updated successfully"]);
            exit;
        }

        if ($action === 'update_plan_details') {
            $stmt = $pdo->prepare("UPDATE plans SET 
                name = ?, 
                price = ?, 
                max_websites = ?, 
                max_agents = ?, 
                ai_enabled = ?, 
                features = ?
                WHERE id = ?");
            
            $stmt->execute([
                $data['name'],
                $data['price'],
                $data['max_websites'],
                $data['max_agents'],
                $data['ai_enabled'] ? 1 : 0,
                json_encode($data['features']),
                $data['id']
            ]);
            
            echo json_encode(["message" => "Plan updated successfully"]);
            exit;
        }

        if ($action === 'create_plan') {
            $stmt = $pdo->prepare("INSERT INTO plans (name, price, max_websites, max_agents, ai_enabled, features) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['name'],
                $data['price'],
                $data['max_websites'],
                $data['max_agents'],
                $data['ai_enabled'] ? 1 : 0,
                json_encode($data['features'])
            ]);
            echo json_encode(["message" => "Plan created successfully", "id" => $pdo->lastInsertId()]);
            exit;
        }



        if ($action === 'update_email_template') {
            $stmt = $pdo->prepare("UPDATE email_templates SET subject = ?, body = ? WHERE id = ?");
            $stmt->execute([$data['subject'], $data['body'], $data['id']]);
            echo json_encode(["message" => "Template updated"]);
            exit;
        }

        if ($action === 'update_platform_settings') {
            $pdo->beginTransaction();
            foreach ($data['settings'] as $key => $value) {
                // Ensure value is string for DB storage
                $strVal = is_array($value) ? json_encode($value) : (string)$value;
                $stmt = $pdo->prepare("INSERT INTO platform_settings (setting_key, setting_value) 
                                     VALUES (?, ?) 
                                     ON DUPLICATE KEY UPDATE setting_value = ?");
                $stmt->execute([$key, $strVal, $strVal]);
            }
            $pdo->commit();
            echo json_encode(["message" => "Platform settings updated"]);
            exit;
        }

        if ($action === 'add_global_knowledge') {
            $stmt = $pdo->prepare("INSERT INTO knowledge_base (tenant_id, website_id, title, content) VALUES (NULL, NULL, ?, ?)");
            $stmt->execute([$data['title'], $data['content']]);
            echo json_encode(["message" => "Global knowledge added"]);
            exit;
        }

        if ($action === 'delete_knowledge') {
            $stmt = $pdo->prepare("DELETE FROM knowledge_base WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(["message" => "Knowledge item deleted"]);
            exit;
        }


    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
