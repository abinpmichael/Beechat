<?php
require_once 'server/api/config.php';

try {
    echo "Starting Blog System V25 Migration...\n";

    // 1. Create blog_posts table
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

    // 2. Check if table is empty, and seed some mock blog posts if it is
    $count = $pdo->query("SELECT COUNT(*) FROM blog_posts")->fetchColumn();
    if ($count == 0) {
        echo "Seeding blog posts...\n";

        $posts = [
            [
                'title' => 'Welcome to BeeChat: The Future of Customer Support',
                'slug' => 'welcome-to-beechat-future-of-support',
                'summary' => 'Discover how BeeChat is transforming customer interactions with ultra-fast AI-powered messaging and custom honey-sweet widget colonies.',
                'content' => '<h1>Welcome to the Hive!</h1><p>Customer support has entered a new era. Today, businesses can no longer afford to keep customers waiting. With BeeChat, we have designed a customer communication platform that operates with the intelligence and speed of a tightly synchronized bee colony.</p><h3>Why BeeChat?</h3><p>Unlike generic widgets, BeeChat relies on dynamic, lightweight, glassmorphic designs and neural language models that learn your website content in seconds. It syncs with your documentation, FAQ sheets, and raw text files to provide helpful answers instantly, freeing up human agents for high-value client needs.</p><h3>Key Features of the Colony</h3><ul><li><strong>Honey-Fast AI:</strong> Average AI responses load in under 0.3 seconds.</li><li><strong>Hex Flow Dashboard:</strong> A modular dashboard built for support agent speed and oversight.</li><li><strong>Queen Oversight:</strong> Support admins can jump into any live chat dynamically with zero interruption.</li></ul><p>We are excited to help you scale your digital cells. Join the hive and watch your conversion rates fly!</p>',
                'image_url' => 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=60',
                'status' => 'published',
                'author' => 'Queen Bee'
            ],
            [
                'title' => 'How AI Chatbots Can Boost Your Sales Conversion',
                'slug' => 'boost-sales-conversion-ai-chatbots',
                'summary' => 'Learn the strategic insights behind deploying instant AI agents to capture leads, qualify visitors, and automate 24/7 engagement.',
                'content' => '<h1>Boost Your Sales Conversion Rates</h1><p>Modern internet visitors have extremely short attention spans. If a visitor lands on your page and cannot find answers to their pricing or configuration questions within 10 seconds, they will leave for a competitor.</p><h3>24/7 Engagement</h3><p>An AI agent never goes to sleep. By qualifying leads automatically at 2:00 AM, capturing email addresses, and scheduling call-backs, you keep your customer pipeline full without keeping your staff awake.</p><h3>The Power of Instant Support</h3><p>According to recent industry studies, responding to a lead within 5 minutes increases the chance of qualification by over 400%. BeeChat helps you meet this standard automatically with custom AI flows and offline ticketing capabilities.</p>',
                'image_url' => 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=800&auto=format&fit=crop&q=60',
                'status' => 'published',
                'author' => 'Drone Commander'
            ],
            [
                'title' => 'Tips for Configuring Your Customer Support Dashboard',
                'slug' => 'tips-configuring-customer-support-dashboard',
                'summary' => 'Streamline agent workflow, organize teams, and configure system rules to maximize your platform performance.',
                'content' => '<h1>Configuring Your Hive for Maximum Performance</h1><p>An organized team is an efficient team. Here are our top three tips for configuring your BeeChat dashboard to ensure your agents resolve tickets in record time:</p><ol><li><strong>Define Clear AI Rule Overrides:</strong> Teach your AI bot what topics it should answer and when to handover to a live human agent.</li><li><strong>Custom Brand Your Widget:</strong> Set the hex color codes and bot avatars to match your brand identity perfectly.</li><li><strong>Set Up Notifications:</strong> Enable browser sounds and email push updates so you are notified immediately when a premium lead requests support.</li></ol>',
                'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
                'status' => 'published',
                'author' => 'Hive Architect'
            ]
        ];

        $stmt = $pdo->prepare("INSERT INTO blog_posts (title, slug, summary, content, image_url, status, author) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($posts as $post) {
            $stmt->execute([
                $post['title'],
                $post['slug'],
                $post['summary'],
                $post['content'],
                $post['image_url'],
                $post['status'],
                $post['author']
            ]);
        }
        echo "Seeding completed.\n";
    }

    echo "SUCCESS: Blog System migration applied successfully.\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
