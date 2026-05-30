<?php
// server/api/train_ai.php — populates knowledge base articles to train the AI assistant
define('HTML_RESPONSE', true);
require_once 'config.php';

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
        .btn { display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 14px 28px; border-radius: 16px; font-weight: bold; font-size: 14px; transition: all 0.2s; margin-top: 20px; box-shadow: 0 4px 12px rgba(15,23,42,0.15); }
        .btn:hover { background: #f59e0b; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,158,11,0.2); }
    </style>
</head>
<body>

<div class="card">
    <div class="logo">🐝 BEE<span>CHAT</span></div>
    <h1>AI Neural Training Console</h1>
    <p class="subtitle">Populating documentation cells, step-by-step tutorials, and links for the AI bot swarm.</p>
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
                "content" => "BeeChat is an advanced AI-powered customer support and live chat platform designed for modern websites. It combines real-time visitor tracking, business hours automation, an autonomous AI support bot, and a unified helpdesk ticketing system. Visitors can load the chat widget, engage in conversation with an automated AI bot, or request a handover to speak directly to a live human agent. Visit the homepage at https://www.beechat.online/ to learn more.",
                "source_url" => "https://www.beechat.online/about"
            ],
            [
                "title" => "Step-by-Step Installation Tutorial & Code Integration",
                "content" => "Follow these simple steps to install the chat widget on your website:
Step 1: Sign up or log into your BeeChat dashboard at https://www.beechat.online/
Step 2: Navigate to 'My Domains' (/dashboard/websites) and click 'Add Website'. Enter your website name and domain.
Step 3: Copy the generated script integration tag: <script src='https://www.beechat.online/widget.js' data-api-key='1d29d7564fa93be470632301a473f3d3' async></script>
Step 4: Paste this script tag right before the closing </body> tag of your website files.
For integrations on WordPress, Shopify, React, Next.js, or HTML files, visit our Integrations Guide at https://www.beechat.online/integrations. If you have questions, view our Help Center at https://www.beechat.online/help.",
                "source_url" => "https://www.beechat.online/integrations"
            ],
            [
                "title" => "How to Configure the AI Bot (Training Steps)",
                "content" => "Follow these steps to enable and train your autonomous AI assistant:
Step 1: Go to the 'My Domains' tab in the dashboard and click 'Manage' next to your website.
Step 2: Under the 'AI Bot' configuration panel, toggle 'Enable AI Bot' to ON.
Step 3: Scroll to the 'Knowledge Base' section. Enter a Title (e.g. business hours or pricing) and write detailed paragraphs, then click 'Add Knowledge Item' to train the bot.
Step 4: To make the bot only reply when your agents are offline, toggle 'AI Offline Only' to ON under 'Neural Config' settings.
For optimization tips, check out our latest articles at https://www.beechat.online/blog.",
                "source_url" => "https://www.beechat.online/settings"
            ],
            [
                "title" => "How to Claim & Respond to Live Chats (Agent Tutorial)",
                "content" => "Follow these steps for live support agents to receive and handle chats:
Step 1: Log into the agent dashboard at https://www.beechat.online/
Step 2: Go to the 'Live Console' tab (/dashboard/leads). When a visitor clicks the 'Live Agent' button in the widget, you will receive an alert notification and hear a warning buzzer.
Step 3: Select the waiting visitor and click 'Claim Chat' to begin messaging them. The AI bot automatically stands down.
Step 4: Type in the input box to chat, attach files, or use canned responses. You can transfer the chat to other team members or flag it for email follow-up.",
                "source_url" => "https://www.beechat.online/help"
            ],
            [
                "title" => "Troubleshooting Widget Offline or Away Mode Status",
                "content" => "If the widget is displaying 'Away Mode' or 'Agents Offline', follow these troubleshooting steps:
Step 1: Check your operating hours and local timezone settings under 'Neural Config' (/dashboard/settings) to ensure you are within business hours.
Step 2: Ensure an agent is logged into the dashboard at https://www.beechat.online/. The widget checks agent presence using a 2-minute activity heartbeat. If no agents are active, the widget switches status to offline and routes visitors to the ticket form.
Step 3: To test your widget configuration locally, use our test suite at https://www.beechat.online/help.",
                "source_url" => "https://www.beechat.online/help"
            ],
            [
                "title" => "Support Ticket Creation & Troubleshooting",
                "content" => "If agents are offline, visitors can click 'Open Ticket' in the widget footer.
Step 1: Enter your email address and phone number.
Step 2: Describe your query. You can attach images or screenshots using the file upload button.
Step 3: Optionally request an instant video call or schedule a meeting.
Step 4: Click 'Raise Ticket'. You will receive an automated tracking ID and an email link to follow up.
Agents can view and manage tickets under the 'Neural Tickets' tab (/dashboard/tickets). Read details at https://www.beechat.online/help.",
                "source_url" => "https://www.beechat.online/help"
            ],
            [
                "title" => "Configuring Business Operating Hours and Timezones",
                "content" => "Tenant administrators can customize opening/closing times and select their specific local timezone under 'Neural Config' (/dashboard/settings) in the agent dashboard. This synchronizes the chat widget's availability with their active operating hours.",
                "source_url" => "https://www.beechat.online/settings"
            ],
            [
                "title" => "BeeChat Subscription Plans and Pricing Cells",
                "content" => "BeeChat offers flexible subscription cells tailored to your colony:
- Worker Bee Plan: Essential live chat, single website domain support, basic AI auto-replies, and 2 active agents.
- Queen Bee Plan: Multi-domain support, unlimited chat history, priority routing, custom branding configurations, and higher AI token quotas.
Upgrade your subscription at the Billing section of the dashboard. Learn more at https://www.beechat.online/#pricing.",
                "source_url" => "https://www.beechat.online/#pricing"
            ]
        ];

        foreach ($articles as $art) {
            // Check if article with same title already exists for this website
            $checkStmt = $pdo->prepare("SELECT id FROM knowledge_base WHERE website_id = ? AND title = ?");
            $checkStmt->execute([$websiteId, $art['title']]);
            $exists = $checkStmt->fetchColumn();

            if ($exists) {
                $updStmt = $pdo->prepare("UPDATE knowledge_base SET content = ?, source_url = ? WHERE id = ?");
                $updStmt->execute([
                    $art['content'],
                    $art['source_url'],
                    $exists
                ]);
                echo "<div class='log-item'>
                    <span>" . htmlspecialchars($art['title']) . "</span>
                    <span class='ok' style='color:#6366f1;'>Updated & Re-Trained</span>
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
