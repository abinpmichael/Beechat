<?php
// server/api/blog.php
require_once 'config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    // Dynamic column check to ensure blog_posts schema matches code expectations
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS blog_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            summary TEXT NOT NULL,
            content LONGTEXT NOT NULL,
            image_url VARCHAR(500) DEFAULT NULL,
            status ENUM('draft', 'published') DEFAULT 'draft',
            author VARCHAR(100) DEFAULT 'Bee Chat Team',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );");

        // 1. Check and add published_at column
        $cols = $pdo->query("SHOW COLUMNS FROM blog_posts LIKE 'published_at'")->fetchAll();
        if (empty($cols)) {
            $pdo->exec("ALTER TABLE blog_posts ADD COLUMN published_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;");
            $pdo->exec("UPDATE blog_posts SET published_at = created_at WHERE published_at IS NULL;");
        }

        // 2. Check and add seo_title column
        $colsTitle = $pdo->query("SHOW COLUMNS FROM blog_posts LIKE 'seo_title'")->fetchAll();
        if (empty($colsTitle)) {
            $pdo->exec("ALTER TABLE blog_posts ADD COLUMN seo_title VARCHAR(255) DEFAULT NULL;");
        }

        // 3. Check and add seo_description column
        $colsDesc = $pdo->query("SHOW COLUMNS FROM blog_posts LIKE 'seo_description'")->fetchAll();
        if (empty($colsDesc)) {
            $pdo->exec("ALTER TABLE blog_posts ADD COLUMN seo_description VARCHAR(500) DEFAULT NULL;");
        }

        // 4. Seed the 5 scheduled blog posts if they do not exist
        $scheduledPosts = [
            [
                'title' => 'Leveraging Live Chat for SaaS Growth: A Comprehensive Guide',
                'slug' => 'leveraging-live-chat-saas-growth',
                'summary' => 'Learn how modern SaaS platforms use live chat systems to capture leads, onboard users, and reduce customer churn through instant in-app support.',
                'content' => '<h1>Leveraging Live Chat for SaaS Growth</h1><p>For modern software-as-a-service (SaaS) companies, customer acquisition is only half the battle. To build a sustainable, recurring revenue model, you must onboard users smoothly and minimize churn. Live chat has emerged as a cornerstone of growth, serving as a direct line of communication during crucial user moments.</p><h3>1. Capturing High-Intent Leads</h3><p>When a prospect is browsing your pricing page, they are demonstrating high intent. If they have a question about security certifications, custom plans, or integrations, any delay in answering can cost you the sale. Live chat allows you to engage these prospects in real-time, handling objections instantly and guiding them to sign up.</p><h3>2. Streamlining User Onboarding</h3><p>The first 24 hours of a trial are critical. If a user gets stuck setting up your tool, they will likely abandon it. By placing a chat widget inside your product dashboard, you give users immediate access to support. In-app chat helps you walk users through the configuration, ensuring they experience the "Aha!" moment quickly.</p><h3>3. Reducing Customer Churn</h3><p>Customer churn is the silent killer of SaaS businesses. Often, users churn because they feel ignored or encounter technical friction they cannot easily resolve. An proactive live chat system helps you identify frustrated users, resolve their issues immediately, and turn a negative experience into a loyalty-building moment.</p>',
                'image_url' => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60',
                'status' => 'published',
                'author' => 'SaaS Growth Advisor',
                'seo_title' => 'Live Chat for SaaS: Increase Growth & Onboarding Rates',
                'seo_description' => 'Discover how SaaS companies leverage live chat to improve user onboarding, boost conversions, and prevent customer churn. Read the ultimate SaaS chat guide.',
                'published_at' => '2026-06-15 09:00:00'
            ],
            [
                'title' => 'The Rise of AI Chatbots in Customer Support: Balancing Automation and Human Touch',
                'slug' => 'ai-chatbots-customer-support-balance-automation',
                'summary' => 'Find the sweet spot between automated instant responses and empathetic human agents in your customer service pipeline.',
                'content' => '<h1>AI Chatbots in Customer Support: The Perfect Balance</h1><p>Artificial Intelligence is transforming customer service at an unprecedented rate. AI chatbots can handle thousands of concurrent conversations, reply in milliseconds, and operate 24/7. However, technology cannot fully replace the empathy and complex problem-solving abilities of human support professionals.</p><h3>The Power of AI Automation</h3><p>AI bots excel at answering routine, repetitive queries. Whether it is tracking a shipment, resetting a password, or explaining a basic pricing tier, AI can resolve these questions instantly. This self-service automation keeps your support queue clear, letting your human agents focus on complex, high-value customer inquiries.</p><h3>When the Human Touch is Essential</h3><p>For sensitive issues, billing disputes, or highly frustrated customers, empathy is paramount. A human agent can read between the lines, express genuine concern, and devise creative solutions that a chatbot cannot. A successful support strategy does not replace humans with AI; it uses AI to empower humans.</p><h3>Building a Hybrid Colony Flow</h3><ul><li><strong>Instant Handover:</strong> Build clear rules that allow the AI to immediately transfer a chat to a human agent when requested.</li><li><strong>Agent Co-Pilot:</strong> Use AI to suggest drafts and search your internal knowledge base for agents while they chat with clients.</li><li><strong>Sentiment Detection:</strong> Train your AI to recognize frustration or urgency and automatically flag those chats for immediate human intervention.</li></ul>',
                'image_url' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
                'status' => 'published',
                'author' => 'AI Integration Lead',
                'seo_title' => 'AI Chatbots vs Human Support: Finding the Perfect Balance',
                'seo_description' => 'How can businesses balance AI automation with human empathy? Explore strategies to build hybrid customer support systems using AI chat agents.',
                'published_at' => '2026-07-15 09:00:00'
            ],
            [
                'title' => 'Maximizing SEO Value with an Integrated Business Blog',
                'slug' => 'maximizing-seo-value-integrated-business-blog',
                'summary' => 'Learn how publishing content directly on your product site drives organic search traffic, boosts authority, and generates quality inbound sales leads.',
                'content' => '<h1>Maximizing SEO Value with an Integrated Business Blog</h1><p>Search Engine Optimization (SEO) is one of the most cost-effective strategies for long-term business growth. While paid advertising stops generating leads the moment you stop paying, high-quality blog content continues to attract organic search traffic for months or even years after publication.</p><h3>1. Targeting Long-Tail Keywords</h3><p>Most customers do not search for brand names; they search for solutions to their problems. An integrated business blog allows you to create dedicated articles targeting specific questions, long-tail keywords, and industry topics. By providing the best answers to these queries, you position your brand as the leading authority in your space.</p><h3>2. Building Domain Authority</h3><p>Search engines rank websites based on authority and relevance. When you regularly publish informative, well-structured articles, other websites are more likely to reference and link back to your content. These backlinks signal to search engines that your site is trustworthy, boosting the search rankings of your entire domain, including your product pages.</p><h3>3. Driving Inbound Lead Conversions</h3><p>Every blog post is an opportunity to convert readers into leads. By placing subtle call-to-actions (CTAs) within your articles—such as signing up for a newsletter, downloading a free guide, or starting a free trial of your software—you capitalize on the high-quality traffic entering your site.</p>',
                'image_url' => 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&auto=format&fit=crop&q=60',
                'status' => 'published',
                'author' => 'SEO Strategist',
                'seo_title' => 'How a Business Blog Boosts SEO & Leads | BeeChat Guide',
                'seo_description' => 'Read how an integrated business blog can drive targeted traffic to your product, build search relevance, and turn readers into customers.',
                'published_at' => '2026-08-15 09:00:00'
            ],
            [
                'title' => 'Designing the Perfect Customer Support Widget for Mobile Users',
                'slug' => 'designing-perfect-customer-support-widget-mobile',
                'summary' => 'With over 50% of web traffic coming from mobile, check out the top UX design principles for building lightweight, responsive, mobile-first support widgets.',
                'content' => '<h1>Designing the Perfect Chat Widget for Mobile Users</h1><p>Mobile web traffic now accounts for more than half of all global internet usage. Yet, many customer support widgets are designed primarily for desktop viewports, leading to frustrating mobile experiences. A poorly designed mobile chat widget can block content, slow down pages, or be impossible to close.</p><h3>1. Screen Real Estate and Placement</h3><p>On desktop, a chat widget takes up a tiny corner of the screen. On mobile, space is at a premium. Your widget launcher should be small enough not to block important call-to-action buttons. When clicked, the chat window should expand to a full-screen or slide-up overlay that is easy to navigate and simple to minimize.</p><h3>2. Tactile Touch Targets</h3><p>Fingers are less precise than mouse cursors. Ensure that all interactive elements—especially close buttons, send buttons, and attachment icons—have a touch target of at least 48x48 pixels. Spacing out elements prevents accidental clicks and reduces user frustration.</p><h3>3. Speed and Performance Optimization</h3><p>Mobile users are frequently on slower cellular networks. A heavy chat widget script can delay page load times, negatively impacting your site\'s bounce rate and SEO. Optimize your widget by lazy loading scripts, compressing assets, and minimizing DOM complexity to keep page speeds lightning-fast.</p>',
                'image_url' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60',
                'status' => 'published',
                'author' => 'Mobile UX Designer',
                'seo_title' => 'Mobile-First Chat Widget Design: Best Practices for Mobile UX',
                'seo_description' => 'Learn how to optimize your customer support widget for mobile users. Review mobile UX design tips, viewport adjustments, and speed optimization techniques.',
                'published_at' => '2026-09-15 09:00:00'
            ],
            [
                'title' => 'How to Build a High-Converting FAQ and Knowledge Base System',
                'slug' => 'build-high-converting-faq-knowledge-base',
                'summary' => 'Self-service support is a powerful tool. Learn how to structure your knowledge base to resolve customer queries before they contact your team.',
                'content' => '<h1>How to Build a High-Converting Knowledge Base</h1><p>Most customers prefer to find answers on their own rather than wait for a support agent. A well-organized knowledge base and FAQ system not only improves customer satisfaction but also drastically reduces the load on your support team by diverting common tickets.</p><h3>1. Structure and Category Hierarchy</h3><p>Organize your articles in a logical, shallow hierarchy. Use broad categories like "Getting Started", "Billing", or "Integrations", and limit sub-categories to prevent users from getting lost. Ensure a robust search bar is prominently displayed at the top of your help center page.</p><h3>2. Write Clear, Action-Oriented Articles</h3><p>Keep your content concise, structured, and easy to read. Use step-by-step numbered lists, bold text for key interface elements, and include screenshots or short screen recordings to guide the user visually. Avoid jargon and write in a friendly, helpful tone.</p><h3>3. Turn Self-Service into Conversions</h3><p>A help center is also part of your sales funnel. If a visitor is reading about how your integrations work, they are evaluating your software. Add links to relevant blog posts or your main landing pages, and make it easy to start a live chat session directly from the help center if they need further assistance.</p>',
                'image_url' => 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60',
                'status' => 'published',
                'author' => 'Help Desk Strategist',
                'seo_title' => 'Knowledge Base Best Practices: Building a Help Desk FAQ',
                'seo_description' => 'Discover how to build a high-converting knowledge base and FAQ section to enable customer self-service support and reduce support ticket load.',
                'published_at' => '2026-10-15 09:00:00'
            ]
        ];

        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM blog_posts WHERE slug = ?");
        $stmtInsert = $pdo->prepare("INSERT INTO blog_posts (title, slug, summary, content, image_url, status, author, seo_title, seo_description, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        foreach ($scheduledPosts as $post) {
            $stmtCheck->execute([$post['slug']]);
            if ($stmtCheck->fetchColumn() == 0) {
                $stmtInsert->execute([
                    $post['title'],
                    $post['slug'],
                    $post['summary'],
                    $post['content'],
                    $post['image_url'],
                    $post['status'],
                    $post['author'],
                    $post['seo_title'],
                    $post['seo_description'],
                    $post['published_at']
                ]);
            }
        }
    } catch (Exception $schemaEx) {
        error_log("Blog schema check failed: " . $schemaEx->getMessage());
    }

    if ($method === 'GET') {
        $action = $_GET['action'] ?? '';
        
        // Super Admin Action: list all posts (including drafts)
        if ($action === 'list_all') {
            $headers = getAuthHeaders();
            $auth = decodeJwt($headers);
            if (!$auth || ($auth['is_superadmin'] ?? 0) !== 1) {
                http_response_code(403);
                echo json_encode(["message" => "Forbidden: SuperAdmin access only"]);
                exit;
            }
            $stmt = $pdo->query("SELECT * FROM blog_posts ORDER BY created_at DESC");
            echo json_encode($stmt->fetchAll());
            exit;
        }

        // Public Action: fetch single blog post by slug
        $slug = $_GET['slug'] ?? '';
        if (!empty($slug)) {
            $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published' AND (published_at IS NULL OR published_at <= NOW()) LIMIT 1");
            $stmt->execute([$slug]);
            $post = $stmt->fetch();
            if ($post) {
                echo json_encode($post);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Blog post not found"]);
            }
            exit;
        }

        // Public Action: fetch all published blog posts
        $stmt = $pdo->query("SELECT * FROM blog_posts WHERE status = 'published' AND (published_at IS NULL OR published_at <= NOW()) ORDER BY COALESCE(published_at, created_at) DESC");
        echo json_encode($stmt->fetchAll());
        exit;
    }

    if ($method === 'POST') {
        // Authenticate Super Admin for all write operations
        $headers = getAuthHeaders();
        $auth = decodeJwt($headers);
        if (!$auth || ($auth['is_superadmin'] ?? 0) !== 1) {
            http_response_code(403);
            echo json_encode(["message" => "Forbidden: SuperAdmin access only"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        if ($action === 'create') {
            if (empty($data['title']) || empty($data['slug']) || empty($data['summary']) || empty($data['content'])) {
                http_response_code(400);
                echo json_encode(["message" => "Required fields missing (title, slug, summary, content)"]);
                exit;
            }

            // Check if slug is unique
            $check = $pdo->prepare("SELECT COUNT(*) FROM blog_posts WHERE slug = ?");
            $check->execute([$data['slug']]);
            if ($check->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(["message" => "A blog post with this slug already exists."]);
                exit;
            }

            $author = $data['author'] ?? 'Bee Chat Team';
            $imageUrl = $data['image_url'] ?? null;
            $status = $data['status'] ?? 'draft';
            $seoTitle = $data['seo_title'] ?? null;
            $seoDescription = $data['seo_description'] ?? null;
            $publishedAt = !empty($data['published_at']) ? str_replace('T', ' ', $data['published_at']) : date('Y-m-d H:i:s');

            $stmt = $pdo->prepare("INSERT INTO blog_posts (title, slug, summary, content, image_url, status, author, seo_title, seo_description, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['title'],
                $data['slug'],
                $data['summary'],
                $data['content'],
                $imageUrl,
                $status,
                $author,
                $seoTitle,
                $seoDescription,
                $publishedAt
            ]);

            echo json_encode(["message" => "Blog post created successfully", "id" => $pdo->lastInsertId()]);
            exit;
        }

        if ($action === 'update') {
            if (empty($data['id']) || empty($data['title']) || empty($data['slug']) || empty($data['summary']) || empty($data['content'])) {
                http_response_code(400);
                echo json_encode(["message" => "Required fields missing (id, title, slug, summary, content)"]);
                exit;
            }

            // Check if slug is unique (excluding current post)
            $check = $pdo->prepare("SELECT COUNT(*) FROM blog_posts WHERE slug = ? AND id != ?");
            $check->execute([$data['slug'], $data['id']]);
            if ($check->fetchColumn() > 0) {
                http_response_code(400);
                echo json_encode(["message" => "A blog post with this slug already exists."]);
                exit;
            }

            $author = $data['author'] ?? 'Bee Chat Team';
            $imageUrl = $data['image_url'] ?? null;
            $status = $data['status'] ?? 'draft';
            $seoTitle = $data['seo_title'] ?? null;
            $seoDescription = $data['seo_description'] ?? null;
            $publishedAt = !empty($data['published_at']) ? str_replace('T', ' ', $data['published_at']) : date('Y-m-d H:i:s');

            $stmt = $pdo->prepare("UPDATE blog_posts SET title = ?, slug = ?, summary = ?, content = ?, image_url = ?, status = ?, author = ?, seo_title = ?, seo_description = ?, published_at = ? WHERE id = ?");
            $stmt->execute([
                $data['title'],
                $data['slug'],
                $data['summary'],
                $data['content'],
                $imageUrl,
                $status,
                $author,
                $seoTitle,
                $seoDescription,
                $publishedAt,
                $data['id']
            ]);

            echo json_encode(["message" => "Blog post updated successfully"]);
            exit;
        }

        if ($action === 'delete') {
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(["message" => "ID required"]);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = ?");
            $stmt->execute([$data['id']]);

            echo json_encode(["message" => "Blog post deleted successfully"]);
            exit;
        }

        http_response_code(400);
        echo json_encode(["message" => "Invalid post action"]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
