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
            if (!isset($settings['jitsi_domain'])) $settings['jitsi_domain'] = 'meet.jit.si';
            if (!isset($settings['platform_contact_widget_api_key'])) $settings['platform_contact_widget_api_key'] = '';
            if (!isset($settings['privacy_policy'])) {
                $settings['privacy_policy'] = '<h2><strong>1. Introduction</strong></h2>' .
                    '<p>Welcome to Bee Chat. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our platform and use our AI-powered customer support services.</p>' .
                    '<h2><strong>2. Data We Collect</strong></h2>' .
                    '<p>We may collect and process the following categories of data:</p>' .
                    '<ul>' .
                    '<li><strong>Account Information:</strong> Name, email address, password, and billing details when you register as a tenant.</li>' .
                    '<li><strong>Visitor Data:</strong> IP addresses, browser types, and activity logs of visitors interacting with our chat widget.</li>' .
                    '<li><strong>Conversation Logs:</strong> Transcripts of chat conversations between visitors, AI bots, and live agents for training and service improvement.</li>' .
                    '</ul>' .
                    '<h2><strong>3. How We Use Your Data</strong></h2>' .
                    '<p>Your data is used to provide, maintain, and optimize our services. Specifically for:</p>' .
                    '<ul>' .
                    '<li>Initializing and personalizing AI-driven chat responses.</li>' .
                    '<li>Processing payments and managing tenant subscriptions.</li>' .
                    '<li>Analyzing platform performance and debugging system issues.</li>' .
                    '</ul>' .
                    '<h2><strong>4. Data Security</strong></h2>' .
                    '<p>We implement industry-standard encryption and security measures to prevent unauthorized access, alteration, or disclosure of your personal data.</p>' .
                    '<h2><strong>5. Contact Us</strong></h2>' .
                    '<p>If you have any questions about this Privacy Policy, please contact us at our official support email.</p>';
            }
            if (!isset($settings['terms_of_service'])) {
                $settings['terms_of_service'] = '<h2><strong>1. Acceptance of Terms</strong></h2>' .
                    '<p>By registering for or using Bee Chat services, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not use our platform.</p>' .
                    '<h2><strong>2. Account Responsibilities</strong></h2>' .
                    '<p>As a tenant, you are responsible for maintaining the confidentiality of your account credentials. You are fully responsible for all activities that occur under your account and chat widget.</p>' .
                    '<h2><strong>3. Acceptable Use</strong></h2>' .
                    '<p>You agree not to use our chat widget or platform to:</p>' .
                    '<ul>' .
                    '<li>Transmit any unlawful, threatening, abusive, or obscene content.</li>' .
                    '<li>Impersonate any person or entity or misrepresent your affiliation.</li>' .
                    '<li>Distribute viruses, malware, or any disruptive software.</li>' .
                    '</ul>' .
                    '<h2><strong>4. Limitation of Liability</strong></h2>' .
                    '<p>Bee Chat shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.</p>' .
                    '<h2><strong>5. Changes to Terms</strong></h2>' .
                    '<p>We reserve the right to modify these Terms of Service at any time. Your continued use of the platform after changes are posted constitutes acceptance of the new terms.</p>';
            }
            
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
            // Total Revenue from invoices
            $total = $pdo->query("SELECT SUM(amount) FROM invoices WHERE status = 'paid'")->fetchColumn() ?? 0;
            
            // Monthly Breakdown
            $monthly = $pdo->query("
                SELECT 
                    YEAR(created_at) as year, 
                    MONTH(created_at) as month, 
                    SUM(amount) as total 
                FROM invoices 
                WHERE status = 'paid'
                GROUP BY YEAR(created_at), MONTH(created_at) 
                ORDER BY year DESC, month DESC
            ")->fetchAll();

            echo json_encode([
                "total_revenue" => $total,
                "monthly_stats" => $monthly
            ]);
            exit;
        }

        if ($action === 'list_inquiries') {
            // Self-healing database check to ensure table exists
            $pdo->exec("CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");

            $stmt = $pdo->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
            echo json_encode($stmt->fetchAll());
            exit;
        }

        exit;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        if ($action === 'refund_transaction') {
            $invoiceId = $data['invoice_id'] ?? null;
            if (!$invoiceId) exit(json_encode(["error" => "Invoice ID required"]));

            // Fetch Stripe secret key
            $stmt = $pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'stripe_secret_key'");
            $stmt->execute();
            $stripeSecret = $stmt->fetchColumn() ?? '';

            if (empty($stripeSecret)) {
                exit(json_encode(["error" => "Stripe not configured on this platform"]));
            }

            // Get invoice info from local DB
            $stmt = $pdo->prepare("SELECT * FROM invoices WHERE id = ?");
            $stmt->execute([$invoiceId]);
            $localInv = $stmt->fetch();
            if (!$localInv) exit(json_encode(["error" => "Invoice record not found"]));

            if ($localInv['status'] === 'refunded') {
                exit(json_encode(["error" => "This transaction is already refunded"]));
            }

            $stripeInvoiceId = $localInv['stripe_invoice_id'];

            require_once 'vendor/autoload.php';
            \Stripe\Stripe::setApiKey($stripeSecret);

            try {
                // If it's a real Stripe invoice ID (starts with in_)
                if (strpos($stripeInvoiceId, 'in_') === 0) {
                    $invoice = \Stripe\Invoice::retrieve($stripeInvoiceId);
                    $chargeId = $invoice->charge;
                    if (!$chargeId) {
                        exit(json_encode(["error" => "No charge associated with this invoice in Stripe"]));
                    }
                    \Stripe\Refund::create([
                        'charge' => $chargeId
                    ]);
                }

                // Update local status in DB
                $stmt = $pdo->prepare("UPDATE invoices SET status = 'refunded' WHERE id = ?");
                $stmt->execute([$invoiceId]);

                echo json_encode(["success" => true, "message" => "Transaction refunded successfully"]);
                exit;
            } catch (Exception $e) {
                exit(json_encode(["error" => "Refund failed: " . $e->getMessage()]));
            }
        }

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
                // Skip the old key to prevent accidental overwrites from stale browser cache
                if ($key === 'openai_api_key') continue;
                
                // Handle new key specifically
                if ($key === 'new_openai_api_key') {
                    if (!empty($value)) {
                        $key = 'openai_api_key';
                    } else {
                        continue;
                    }
                }

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

        if ($action === 'delete_inquiry') {
            $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(["message" => "Inquiry deleted"]);
            exit;
        }


    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
