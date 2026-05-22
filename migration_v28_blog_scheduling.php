<?php
// migration_v28_blog_scheduling.php
require_once 'server/api/config.php';

try {
    echo "Starting Blog Scheduling V28 Migration...\n";

    // 1. Add published_at column if it does not exist
    $cols = $pdo->query("SHOW COLUMNS FROM blog_posts LIKE 'published_at'")->fetchAll();
    if (empty($cols)) {
        $pdo->exec("ALTER TABLE blog_posts ADD COLUMN published_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;");
        echo "Added 'published_at' column.\n";
    } else {
        echo "'published_at' column already exists.\n";
    }

    // 2. Set existing NULL published_at values to created_at
    $pdo->exec("UPDATE blog_posts SET published_at = created_at WHERE published_at IS NULL;");
    echo "Synchronized existing posts' published_at dates.\n";

    // 3. Define and programmatically generate 52 weekly blog posts (26 in the past, 26 in the future)
    $topics = [
        ["title" => "10 Ways to Reduce Support Tickets with AI Chatbots", "category" => "AI & Automation", "slug" => "reduce-support-tickets-ai-chatbots", "image_index" => 0, "author" => "Queen Bee"],
        ["title" => "Why Empathy Still Matters in the Age of Automated Support", "category" => "Customer Experience", "slug" => "empathy-matters-automated-support", "image_index" => 1, "author" => "Queen Bee"],
        ["title" => "The Ultimate Guide to Live Chat Widget Customization", "category" => "Widget Customization", "slug" => "guide-live-chat-widget-customization", "image_index" => 2, "author" => "Hive Architect"],
        ["title" => "How to Set Up Automated Lead Scoring Using Chat Interactions", "category" => "SaaS & Growth", "slug" => "automated-lead-scoring-chat-interactions", "image_index" => 3, "author" => "SaaS Growth Advisor"],
        ["title" => "Unlocking SaaS Growth: The Power of In-App Messaging", "category" => "SaaS & Growth", "slug" => "unlocking-saas-growth-in-app-messaging", "image_index" => 4, "author" => "SaaS Growth Advisor"],
        ["title" => "Best Practices for Training Your AI Chatbot with Custom Data", "category" => "AI & Automation", "slug" => "practices-training-ai-chatbot-custom-data", "image_index" => 5, "author" => "AI Integration Lead"],
        ["title" => "How to Minimize Customer Churn Using Proactive Support", "category" => "Customer Experience", "slug" => "minimize-customer-churn-proactive-support", "image_index" => 6, "author" => "Queen Bee"],
        ["title" => "A Guide to HIPAA and GDPR Compliance for Modern Live Chat", "category" => "Security & Technology", "slug" => "guide-hipaa-gdpr-compliance-live-chat", "image_index" => 7, "author" => "Hive Architect"],
        ["title" => "Structuring Your Help Center for Maximum Customer Self-Service", "category" => "Tips & Best Practices", "slug" => "structuring-help-center-customer-self-service", "image_index" => 8, "author" => "Help Desk Strategist"],
        ["title" => "The Role of Live Chat in E-commerce Checkout Optimization", "category" => "SaaS & Growth", "slug" => "role-live-chat-ecommerce-checkout-optimization", "image_index" => 9, "author" => "SaaS Growth Advisor"],
        ["title" => "Setting Up Multi-Tenant Support Systems: A SaaS Playbook", "category" => "Security & Technology", "slug" => "setting-up-multi-tenant-support-systems", "image_index" => 0, "author" => "Hive Architect"],
        ["title" => "How Write the Perfect Chat Greeting to Boost Engagement", "category" => "Customer Experience", "slug" => "write-perfect-chat-greeting-boost-engagement", "image_index" => 1, "author" => "Queen Bee"],
        ["title" => "Top Metrics Every Support Manager Needs to Track Daily", "category" => "Tips & Best Practices", "slug" => "top-metrics-support-manager-track-daily", "image_index" => 2, "author" => "Help Desk Strategist"],
        ["title" => "Balancing AI Co-Pilots and Human Support Agents", "category" => "AI & Automation", "slug" => "balancing-ai-copilots-human-support-agents", "image_index" => 3, "author" => "AI Integration Lead"],
        ["title" => "Designing Beautiful, Glassmorphic Chat Widgets for Modern Sites", "category" => "Widget Customization", "slug" => "designing-glassmorphic-chat-widgets-modern-sites", "image_index" => 4, "author" => "Mobile UX Designer"],
        ["title" => "How BeeChat Fast AI Achieves Sub-300ms Response Times", "category" => "Security & Technology", "slug" => "beechat-fast-ai-achieves-sub-300ms-response", "image_index" => 5, "author" => "AI Integration Lead"],
        ["title" => "The Psychology of Color in Customer Support Chat Widgets", "category" => "Widget Customization", "slug" => "psychology-color-customer-support-chat-widgets", "image_index" => 6, "author" => "Mobile UX Designer"],
        ["title" => "Drafting the Perfect Auto-Responder for Out-of-Office Hours", "category" => "Tips & Best Practices", "slug" => "drafting-auto-responder-out-of-office-hours", "image_index" => 7, "author" => "Help Desk Strategist"],
        ["title" => "How Real-Time Visitor Tracking Transforms Sales Pipeline Speed", "category" => "SaaS & Growth", "slug" => "real-time-visitor-tracking-sales-pipeline-speed", "image_index" => 8, "author" => "SaaS Growth Advisor"],
        ["title" => "A Deep Dive into Socket.IO: Scaling Live Chat Connections", "category" => "Security & Technology", "slug" => "deep-dive-socketio-scaling-live-chat", "image_index" => 9, "author" => "Hive Architect"],
        ["title" => "Building a Seamless Omni-Channel Support Queue for Support Teams", "category" => "Tips & Best Practices", "slug" => "building-seamless-omnichannel-support-queue", "image_index" => 0, "author" => "Help Desk Strategist"],
        ["title" => "Why Mobile-First Chat Widgets Are Essential for Modern SaaS", "category" => "Widget Customization", "slug" => "why-mobile-first-chat-widgets-essential-saas", "image_index" => 1, "author" => "Mobile UX Designer"],
        ["title" => "How to Deal with Frustrated Customers Over Live Chat", "category" => "Customer Experience", "slug" => "deal-with-frustrated-customers-live-chat", "image_index" => 2, "author" => "Queen Bee"],
        ["title" => "Creating a Customer-Centric Culture in Remote Support Teams", "category" => "Tips & Best Practices", "slug" => "creating-customer-centric-culture-remote-support", "image_index" => 3, "author" => "Help Desk Strategist"],
        ["title" => "Using Live Chat to Onboard New SaaS Users and Improve Retention", "category" => "SaaS & Growth", "slug" => "live-chat-onboard-new-saas-users-retention", "image_index" => 4, "author" => "SaaS Growth Advisor"],
        ["title" => "The Benefits of Canned Responses and How to Use Them Wisely", "category" => "Tips & Best Practices", "slug" => "benefits-canned-responses-how-to-use-wisely", "image_index" => 5, "author" => "Help Desk Strategist"],
        ["title" => "An Introduction to Chatbot NLP and Understanding Intent", "category" => "AI & Automation", "slug" => "introduction-chatbot-nlp-understanding-intent", "image_index" => 6, "author" => "AI Integration Lead"],
        ["title" => "How to Integrate Live Chat with Your CRM for Seamless Sales Leads", "category" => "SaaS & Growth", "slug" => "integrate-live-chat-crm-seamless-sales-leads", "image_index" => 7, "author" => "SaaS Growth Advisor"],
        ["title" => "Securing Customer Data: Best Practices for Live Chat Platforms", "category" => "Security & Technology", "slug" => "securing-customer-data-live-chat-platforms", "image_index" => 8, "author" => "Hive Architect"],
        ["title" => "How Custom Bot Avatars Build Trust and Brand Identity", "category" => "Widget Customization", "slug" => "how-custom-bot-avatars-build-trust-brand", "image_index" => 9, "author" => "Mobile UX Designer"],
        ["title" => "The Impact of Fast Support on Customer Lifetime Value (LTV)", "category" => "Customer Experience", "slug" => "impact-fast-support-customer-lifetime-value", "image_index" => 0, "author" => "Queen Bee"],
        ["title" => "Strategies for Running a 24/7 Support Desk on a Budget", "category" => "Tips & Best Practices", "slug" => "strategies-running-247-support-desk-budget", "image_index" => 1, "author" => "Help Desk Strategist"],
        ["title" => "Converting Anonymous Web Traffic into Premium Qualified Leads", "category" => "SaaS & Growth", "slug" => "converting-anonymous-web-traffic-premium-leads", "image_index" => 2, "author" => "SaaS Growth Advisor"],
        ["title" => "Creating Interactive Feedback Surveys Post-Chat Session", "category" => "Customer Experience", "slug" => "creating-interactive-feedback-surveys-post-chat", "image_index" => 3, "author" => "Queen Bee"],
        ["title" => "How to Maximize Organic SEO Traffic with an Integrated Blog", "category" => "SaaS & Growth", "slug" => "maximize-organic-seo-traffic-integrated-blog", "image_index" => 4, "author" => "SEO Strategist"],
        ["title" => "Handling Support Peak Hours: Tips for Hive Managers", "category" => "Tips & Best Practices", "slug" => "handling-support-peak-hours-hive-managers", "image_index" => 5, "author" => "Help Desk Strategist"],
        ["title" => "Why Real-Time Chat is Replacing Traditional Email Helpdesks", "category" => "Customer Experience", "slug" => "why-realtime-chat-replacing-traditional-email", "image_index" => 6, "author" => "Queen Bee"],
        ["title" => "A Guide to Setting Up Escalation Rules for Support Tickets", "category" => "Tips & Best Practices", "slug" => "guide-setting-up-escalation-rules-support", "image_index" => 7, "author" => "Help Desk Strategist"],
        ["title" => "Building an Internal Knowledge Base for Support Agent Training", "category" => "Tips & Best Practices", "slug" => "building-internal-knowledge-base-agent-training", "image_index" => 8, "author" => "Help Desk Strategist"],
        ["title" => "How Localizing Chat Widgets Boosts Global Customer Satisfaction", "category" => "Widget Customization", "slug" => "how-localizing-chat-widgets-boosts-satisfaction", "image_index" => 9, "author" => "Mobile UX Designer"],
        ["title" => "Why Fast Live Chat Response Times are Crucial for E-commerce", "category" => "Customer Experience", "slug" => "why-fast-live-chat-response-crucial-ecommerce", "image_index" => 0, "author" => "Queen Bee"],
        ["title" => "Using AI to Automatically Classify and Route Incoming Chat Sessions", "category" => "AI & Automation", "slug" => "using-ai-classify-route-incoming-chat-sessions", "image_index" => 1, "author" => "AI Integration Lead"],
        ["title" => "How BeeChat Widget Colonies Segment Customer Queries Instantly", "category" => "Widget Customization", "slug" => "beechat-widget-colonies-segment-queries-instantly", "image_index" => 2, "author" => "Hive Architect"],
        ["title" => "Understanding the Customer Journey via Chat Analytics", "category" => "SaaS & Growth", "slug" => "understanding-customer-journey-chat-analytics", "image_index" => 3, "author" => "SaaS Growth Advisor"],
        ["title" => "The Future of AI Agents: What to Expect in the Next 5 Years", "category" => "AI & Automation", "slug" => "future-ai-agents-expect-next-5-years", "image_index" => 4, "author" => "AI Integration Lead"],
        ["title" => "How to Write Engaging Follow-Up Emails After a Chat Session", "category" => "Customer Experience", "slug" => "write-engaging-followup-emails-after-chat", "image_index" => 5, "author" => "Queen Bee"],
        ["title" => "Preventing Spam and Abuse in Public Live Chat Widgets", "category" => "Security & Technology", "slug" => "preventing-spam-abuse-public-live-chat-widgets", "image_index" => 6, "author" => "Hive Architect"],
        ["title" => "A Checklist for Migrating to a Modern Live Chat Platform", "category" => "Tips & Best Practices", "slug" => "checklist-migrating-modern-live-chat-platform", "image_index" => 7, "author" => "Help Desk Strategist"],
        ["title" => "How to Train Agents on Active Listening in Written Chat", "category" => "Tips & Best Practices", "slug" => "train-agents-active-listening-written-chat", "image_index" => 8, "author" => "Help Desk Strategist"],
        ["title" => "The Importance of SLA Management in Enterprise Support", "category" => "Tips & Best Practices", "slug" => "importance-sla-management-enterprise-support", "image_index" => 9, "author" => "Help Desk Strategist"],
        ["title" => "How to Use Co-Browsing to Solve Complex Technical Tickets", "category" => "Security & Technology", "slug" => "use-cobrowsing-solve-complex-technical-tickets", "image_index" => 0, "author" => "Hive Architect"],
        ["title" => "Unifying Live Chat and Knowledge Base for Smart Self-Service", "category" => "AI & Automation", "slug" => "unifying-live-chat-knowledge-base-self-service", "image_index" => 1, "author" => "AI Integration Lead"]
    ];

    $unsplashImages = [
        "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&auto=format&fit=crop&q=60"
    ];

    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM blog_posts WHERE slug = ?");
    $stmtInsert = $pdo->prepare("INSERT INTO blog_posts (title, slug, summary, content, image_url, status, author, seo_title, seo_description, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    for ($i = 0; $i < count($topics); $i++) {
        $t = $topics[$i];
        $title = $t['title'];
        $category = $t['category'];
        $slug = $t['slug'];
        $author = $t['author'];
        $image_url = $unsplashImages[$t['image_index']];
        
        // Distribute date exactly 1 week (7 days) apart relative to current date (May 22, 2026)
        // 26 in the past, 26 in the future
        if ($i < 26) {
            $weeksAgo = 26 - $i;
            $published_at = date('Y-m-d H:i:s', strtotime("-" . $weeksAgo . " weeks - " . ($i % 24) . " hours - " . ($i * 7 % 60) . " minutes"));
        } else {
            $weeksAhead = $i - 26;
            $published_at = date('Y-m-d H:i:s', strtotime("+" . $weeksAhead . " weeks + 2 days + " . ($i % 24) . " hours + " . ($i * 7 % 60) . " minutes"));
        }
        
        $summary = "Explore standard practices for '{$title}' in this expert guide. Learn how to optimize your {$category} workflows to grow your platform and drive more organic business value with BeeChat.";
        
        $seo_title = $title . " | BeeChat Blog";
        $seo_description = substr("Read our definitive guide on {$title}. Learn strategies, UX frameworks, and integration tips from the BeeChat team to boost performance.", 0, 155);
        
        $content = "<h1>{$title}</h1>";
        $content .= "<p>In modern web applications and SaaS business models, customer interaction plays a vital role. When we discuss <strong>{$title}</strong>, we are addressing a critical component of customer acquisition and satisfaction. Leveraging modern live chat systems allows businesses to bridge the gap between their services and customer expectations.</p>";
        
        if ($category === "AI & Automation") {
            $content .= "<h3>Why AI and Automation are Transforming Support</h3>";
            $content .= "<p>Deploying smart artificial intelligence allows your business to scale operations without exponentially increasing human overhead. A system that trains on FAQ documentation can resolve user concerns in milliseconds.</p>";
            $content .= "<ul>";
            $content .= "<li><strong>Instant Answers:</strong> Average bot response times are sub-0.5 seconds, satisfying immediate user expectations.</li>";
            $content .= "<li><strong>24/7 Support Coverage:</strong> Capture leads and qualify prospects at 2:00 AM without keeping your staff awake.</li>";
            $content .= "<li><strong>Intelligent Query Classification:</strong> Automatically route technical bugs to developers and billing issues to accounting.</li>";
            $content .= "</ul>";
            $content .= "<h3>Finding the Sweet Spot</h3>";
            $content .= "<p>While automation handles the high volume of repetitive questions, human empathy remains irreplaceable for complex, high-value negotiations or billing disputes. Maintaining a seamless handover process is key.</p>";
        } else if ($category === "Customer Experience") {
            $content .= "<h3>Designing for User Experience & Delight</h3>";
            $content .= "<p>Customer experience is the sum of every touchpoint a user has with your brand. Implementing live chat gives users immediate access to support exactly when they need it, creating a positive emotional association with your platform.</p>";
            $content .= "<ol>";
            $content .= "<li><strong>Acknowledge Instantly:</strong> Send a quick welcome message to assure the customer their query was received.</li>";
            $content .= "<li><strong>Use Empathy-Driven Copy:</strong> Adopt a friendly, helpful, and concise tone in all interactions.</li>";
            $content .= "<li><strong>Collect Post-Chat Feedback:</strong> Allow users to rate their experience so you can continuously iterate and improve.</li>";
            $content .= "</ol>";
            $content .= "<h3>Setting Up Notification Alerts</h3>";
            $content .= "<p>Never let a message sit unreplied. Configuring clear desktop audio notifications and email fallbacks ensures that agents are ready to engage the moment a visitor strikes up a conversation.</p>";
        } else if ($category === "SaaS & Growth") {
            $content .= "<h3>Driving SaaS Conversions and Retention</h3>";
            $content .= "<p>For software-as-a-service (SaaS) applications, user growth relies on smooth onboarding, high-intent lead qualification, and low customer churn. Live chat serves as a powerful funnel tool across all stages of the customer journey.</p>";
            $content .= "<h3>1. Pricing Page Lead Capture</h3>";
            $content .= "<p>When visitors land on your pricing page, they are demonstrating high purchase intent. If they have custom integration questions, answering them live can instantly secure a subscription signup.</p>";
            $content .= "<h3>2. Dashboard User Onboarding</h3>";
            $content .= "<p>The first few hours after registering are critical. Help new users configure their dashboards, set up system settings, and experience their 'Aha!' moment in record time by offering contextual help right inside the app.</p>";
            $content .= "<h3>3. Retention & Reducing Churn</h3>";
            $content .= "<p>Proactively reaching out to users who experience errors or spend an unusually long time on configuration tasks can help you resolve friction before they decide to cancel.</p>";
        } else if ($category === "Widget Customization") {
            $content .= "<h3>The Power of Widget Customization and Branding</h3>";
            $content .= "<p>A customer support widget shouldn't look like an afterthought. It should feel like an organic extension of your website. By matching color palettes, fonts, and brand avatars, you increase user trust and engagement rates.</p>";
            $content .= "<ul>";
            $content .= "<li><strong>Consistent Theme:</strong> Set widget brand colors to match your site's primary and secondary accent colors.</li>";
            $content .= "<li><strong>Avatars & Names:</strong> Personalize the chat interface with actual agent pictures or custom illustrations.</li>";
            $content .= "<li><strong>Glassmorphic Style:</strong> Apply modern CSS visual effects like backdrop-blur and subtle shadows for a premium, sleek look.</li>";
            $content .= "</ul>";
            $content .= "<h3>Optimizing for Mobile Devices</h3>";
            $content .= "<p>Ensure the widget launcher is small enough on mobile viewports so it doesn't block crucial CTA buttons or navigation menus. When active, it should expand to a clean, tactile overlay.</p>";
        } else if ($category === "Security & Technology") {
            $content .= "<h3>Scaling Infrastructure and Data Security</h3>";
            $content .= "<p>Real-time communication demands robust technology. Modern chat frameworks rely on WebSockets and event-driven architectures to deliver messages under 100 milliseconds across the globe.</p>";
            $content .= "<h3>Ensuring Compliance & Privacy</h3>";
            $content .= "<p>Handling customer data comes with significant responsibility. Implement industry standards to protect user privacy and comply with global regulations:</p>";
            $content .= "<ul>";
            $content .= "<li><strong>Data Encryption:</strong> Encrypt all communications in transit using TLS/SSL and encrypt sensitive info at rest.</li>";
            $content .= "<li><strong>JWT Authentication:</strong> Secure admin routes and dashboard endpoints using JSON Web Tokens with strict expiration checks.</li>";
            $content .= "<li><strong>Sanitized Content:</strong> Sanitize all message payloads to prevent cross-site scripting (XSS) and SQL injection vectors.</li>";
            $content .= "</ul>";
        } else { // Tips & Best Practices
            $content .= "<h3>Core Strategies for Support Excellence</h3>";
            $content .= "<p>Operational excellence is built on consistent habits, team organization, and clear performance targets. Adopt these rules of thumb to streamline your team's support workflows:</p>";
            $content .= "<ul>";
            $content .= "<li><strong>Develop Smart Canned Responses:</strong> Save answers to repetitive queries to respond in seconds, but customize them before sending.</li>";
            $content .= "<li><strong>Establish SLA Targets:</strong> Define targets for first-response times and resolution times to maintain quality standards.</li>";
            $content .= "</ul>";
            $content .= "<h3>Continuously Audit Documentation</h3>";
            $content .= "<p>Regularly review help center articles to ensure they reflect current product features. An accurate self-service library deflects tickets and improves agent productivity.</p>";
        }
        
        $content .= "<h3>Conclusion</h3><p>Applying best practices to <strong>{$title}</strong> will transform your support operation into a growth driver. By combining smart technology like BeeChat with human-centric support design, you create experiences that turn visitors into loyal customers.</p>";

        $stmtCheck->execute([$slug]);
        if ($stmtCheck->fetchColumn() == 0) {
            $stmtInsert->execute([
                $title,
                $slug,
                $summary,
                $content,
                $image_url,
                'published',
                $author,
                $seo_title,
                $seo_description,
                $published_at
            ]);
            echo "Seeded post: '{$title}' (scheduled for {$published_at}).\n";
        } else {
            echo "Post with slug '{$slug}' already exists. Skipping.\n";
        }
    }
 
    echo "SUCCESS: Blog Scheduling migration applied successfully.\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
