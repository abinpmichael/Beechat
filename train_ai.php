<?php
// train_ai.php — populates knowledge base articles to train the AI assistant
define('HTML_RESPONSE', true);
require_once 'server/api/config.php';

header("Content-Type: text/html; charset=utf-8");

echo "<!DOCTYPE html>
<html>
<head>
    <title>BeeChat AI Training Console</title>
    <link href='https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap' rel='stylesheet'>
    <style>
        body { font-family: 'Outfit', sans-serif; background: #fafafc; color: #1e293b; padding: 40px; margin: 0; }
        .card { max-width: 800px; margin: 0 auto; background: white; border-radius: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; padding: 40px; }
        .logo { font-size: 28px; font-weight: 900; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .logo span { color: #f59e0b; }
        h1 { font-size: 32px; font-weight: 900; margin: 0 0 10px 0; color: #0f172a; }
        p.subtitle { color: #64748b; font-weight: 500; font-size: 16px; margin: 0 0 30px 0; }
        .status-box { padding: 24px; border-radius: 20px; font-weight: bold; margin-bottom: 30px; font-size: 14px; }
        .status-box.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .status-box.error { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
        .log-section { border-top: 1px solid #f1f5f9; padding-top: 30px; }
        .log-item { display: flex; justify-content: space-between; padding: 12px 16px; background: #f8fafc; border-radius: 12px; margin-bottom: 8px; font-size: 14px; font-weight: 600; border: 1px solid #f1f5f9; }
        .log-item span.ok { color: #10b981; }
        .log-item span.existed { color: #6366f1; }
        .btn { display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 14px 28px; border-radius: 16px; font-weight: bold; font-size: 14px; transition: all 0.2s; margin-top: 20px; box-shadow: 0 4px 12px rgba(15,23,42,0.15); }
        .btn:hover { background: #f59e0b; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,158,11,0.2); }
    </style>
</head>
<body>

<div class="card">
    <div class="logo">🐝 BEE<span>CHAT</span></div>
    <h1>AI Neural Training Console</h1>
    <p class="subtitle">Populating documentation cells and tutorials for the AI bot swarm.</p>
";

$targetKey = '1d29d7564fa93be470632301a473f3d3';

try {
    // 1. Locate the website and tenant
    $stmt = $pdo->prepare("SELECT id, tenant_id FROM websites WHERE api_key = ?");
    $stmt->execute([$targetKey]);
    $site = $stmt->fetch();

    if (!$site) {
        echo "<div class='status-box error'>
            ❌ ERROR: Website with API Key '$targetKey' not found in database. 
            Please ensure you have configured this website widget first inside the dashboard.
        </div>";
    } else {
        $websiteId = $site['id'];
        $tenantId  = $site['tenant_id'];

        echo "<div class='status-box success'>
            ✔️ SUCCESS: Found Website ID #$websiteId (Tenant ID #$tenantId) matching API key. Starting logic injection...
        </div>";

        echo "<div class='log-section'>";

        $articles = [
            [
                "title" => "About BeeChat and How it Works",
                "content" => "BeeChat is an advanced AI-powered customer support and live chat platform designed for modern websites. It combines real-time visitor tracking, business hours automation, an autonomous AI support bot, and a unified helpdesk ticketing system. Visitors can load the chat widget, engage in conversation with an automated AI bot, or request a handover to speak directly to a live human agent.",
                "source_url" => "https://www.beechat.online/about"
            ],
            [
                "title" => "How to Embed and Install the BeeChat Widget",
                "content" => "To install the BeeChat widget, copy the custom integration script from the 'My Domains' section of the dashboard. The code looks like this: <script src='https://www.beechat.online/widget.js' data-api-key='YOUR_API_KEY' async></script>. Paste this single line of code right before the closing </body> tag of your website. The widget will automatically load and render a chat icon at the bottom right corner.",
                "source_url" => "https://www.beechat.online/help"
            ],
            [
                "title" => "How the AI Support Bot Answers Questions",
                "content" => "The autonomous AI Bot learns from files, custom documents, and manual Q&A items uploaded in the Knowledge Base settings. When a visitor sends a message, the AI engine scans the knowledge base context and generates an accurate response. The AI bot will only run if AI is enabled for the site and if set to 'Offline Only' it will stand down whenever a live agent is logged in.",
                "source_url" => "https://www.beechat.online/help"
            ],
            [
                "title" => "How Live Handover and Claiming Chats Works",
                "content" => "When a visitor requests a human agent, the chat status is set to 'waiting' and the agent console receives a real-time notification with sound. Agents logged into the Live Console can view all waiting visitors and click 'Claim Chat' to immediately connect. Once claimed, the agent can text the visitor in real-time, share files, add internal notes, or transfer the chat to another agent.",
                "source_url" => "https://www.beechat.online/help"
            ],
            [
                "title" => "Troubleshooting Widget Offline or Away Mode Status",
                "content" => "The chat widget automatically adjusts its availability based on business hours and agent status. It will show 'Away Mode' if outside business hours. If inside business hours but no agents are logged in, it will show 'Agents Offline' and display a support ticket form. The system detects active agents using a 2-minute activity heartbeat while they are logged into the dashboard.",
                "source_url" => "https://www.beechat.online/help"
            ],
            [
                "title" => "Tickets and Ticket Escalation",
                "content" => "If no live agents are online, visitors can submit support tickets directly from the chat widget. Support tickets generate a unique tracking ID, queue automated email confirmations using the platform's SMTP server, and route straight to the Neural Tickets section in the agent dashboard where agents can reply or escalate issues.",
                "source_url" => "https://www.beechat.online/help"
            ],
            [
                "title" => "Configuring Business Operating Hours and Timezones",
                "content" => "Tenant administrators can customize opening/closing times and select their specific local timezone under 'Neural Config' in the agent dashboard. This synchronizes the chat widget's availability with their active operating hours.",
                "source_url" => "https://www.beechat.online/settings"
            ],
            [
                "title" => "BeeChat Subscription Plans and Pricing Cells",
                "content" => "BeeChat offers tiered pricing cells designed to grow with your colony:
- Worker Bee Plan: Essential live chat, single website domain support, basic AI auto-replies, and 2 active agents.
- Queen Bee Plan: Multi-domain support, unlimited chat history, priority routing, custom branding configurations, and higher AI token quotas.
Users can manage and upgrade billing from the Overview tab.",
                "source_url" => "https://www.beechat.online/#pricing"
            ]
        ];

        foreach ($articles as $art) {
            // Check if article with same title already exists for this website
            $checkStmt = $pdo->prepare("SELECT id FROM knowledge_base WHERE website_id = ? AND title = ?");
            $checkStmt->execute([$websiteId, $art['title']]);
            $exists = $checkStmt->fetchColumn();

            if ($exists) {
                echo "<div class='log-item'>
                    <span>" . htmlspecialchars($art['title']) . "</span>
                    <span class='existed'>Already Trained</span>
                </div>";
            } else {
                $insStmt = $pdo->prepare("INSERT INTO knowledge_base (tenant_id, website_id, title, content, source_url) VALUES (?, ?, ?, ?, ?)");
                $insStmt->execute([
                    $tenantId,
                    $websiteId,
                    $art['title'],
                    $art['content'],
                    $art['source_url']
                ]);
                echo "<div class='log-item'>
                    <span>" . htmlspecialchars($art['title']) . "</span>
                    <span class='ok'>Injected & Trained Successfully</span>
                </div>";
            }
        }

        echo "</div>"; // end log-section
        echo "<p style='margin-top: 30px; font-weight: bold; color: #10b981;'>🎉 Neural training is complete! Your AI Assistant is now equipped to answer questions about the app's features, setup, and troubleshooting.</p>";
    }

} catch (Exception $e) {
    echo "<div class='status-box error'>
        ❌ DATABASE ERROR: " . htmlspecialchars($e->getMessage()) . "
    </div>";
}

echo "
    <div style='text-align: center; margin-top: 30px;'>
        <a href='/dashboard' class='btn'>Back to dashboard</a>
    </div>
</div>

</body>
</html>";
?>
