<?php
// Root index.php to pre-render SEO/AEO/GEO tags server-side
$config_paths = [
    __DIR__ . '/server/api/config.php',
    __DIR__ . '/../../server/api/config.php',
    __DIR__ . '/../server/api/config.php'
];
$config_path = null;
foreach ($config_paths as $path) {
    if (file_exists($path)) {
        $config_path = $path;
        break;
    }
}
$settings = [];

if ($config_path) {
    try {
        // Prevent config.php from sending API JSON headers
        define('HTML_RESPONSE', true);
        require_once $config_path;
        
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN (
            'platform_name', 'seo_title', 'seo_description', 'seo_keywords', 'seo_canonical_url', 'seo_author', 'seo_robots',
            'og_title', 'og_description', 'og_image', 'twitter_handle', 'geo_region', 'geo_placename', 'geo_position', 'aeo_faq_json', 'gtm_id', 'google_analytics_id', 'support_email', 'platform_currency'
        )");
        foreach ($stmt->fetchAll() as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
    } catch (Exception $e) {
        // Fallback silently if database is unreachable
    }
}

// ─── Defaults ────────────────────────────────────────────────────────
$platform_name  = $settings['platform_name'] ?? 'Bee Chat';
$seo_title      = $settings['seo_title'] ?? 'Bee Chat | AI-Powered Customer Support Platform';
$seo_desc       = $settings['seo_description'] ?? 'Elevate your customer support with Bee Chat. The premium AI-driven chat platform for businesses.';
$seo_keywords   = $settings['seo_keywords'] ?? 'AI Chat, Live Support, Customer Engagement, SaaS Chat, Bee Chat, Real-time Messaging';
$seo_author     = $settings['seo_author'] ?? 'Bee Chat Team';
$seo_robots     = $settings['seo_robots'] ?? 'index, follow';
$seo_canonical  = $settings['seo_canonical_url'] ?? 'https://www.beechat.online/';
$og_title       = $settings['og_title'] ?? $seo_title;
$og_desc        = $settings['og_description'] ?? $seo_desc;
$og_image       = $settings['og_image'] ?? '/og-image.png';
$twitter_handle = $settings['twitter_handle'] ?? '@BeeChatAI';

// Ensure canonical URL has no trailing slash to build clean paths
$domain_base    = rtrim($seo_canonical, '/');

// Parse request path relative to possible application base dir
$script_name    = $_SERVER['SCRIPT_NAME'] ?? '';
$base_dir       = dirname($script_name);
$base_dir       = str_replace('\\', '/', $base_dir);
$base_dir       = rtrim($base_dir, '/');

$request_uri    = $_SERVER['REQUEST_URI'] ?? '';
$request_path   = parse_url($request_uri, PHP_URL_PATH) ?: '/';

if ($base_dir !== '' && strpos($request_path, $base_dir) === 0) {
    $request_path = substr($request_path, strlen($base_dir));
}

if (empty($request_path)) {
    $request_path = '/';
} else {
    $request_path = '/' . ltrim($request_path, '/');
    if ($request_path !== '/') {
        $request_path = rtrim($request_path, '/');
    }
}

$current_canonical = $domain_base . ($request_path === '/' ? '/' : $request_path);

// Check if dynamic blog post is requested
$blog_post = null;
if (preg_match('#^/blog/([^/]+)$#', $request_path, $matches)) {
    $post_slug = $matches[1];
    if ($config_path && isset($pdo)) {
        try {
            $stmt = $pdo->prepare("SELECT title, summary, content, image_url, author, seo_title, seo_description, published_at, created_at FROM blog_posts WHERE slug = ? AND status = 'published' AND (published_at IS NULL OR published_at <= NOW()) LIMIT 1");
            $stmt->execute([$post_slug]);
            $blog_post = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            // Ignore DB errors
        }
    }
}

// ─── Route-level SEO: unique titles, noindex for app screens, real 404s ──
$route_meta = [
    '/integrations' => [$platform_name . ' Integrations – WordPress, Shopify, WhatsApp & More',
                        'Connect the ' . $platform_name . ' AI chat widget to WordPress, Shopify, WooCommerce, HubSpot, WhatsApp and more, or build your own with the REST API and webhooks.'],
    '/help'         => [$platform_name . ' Help Center – Setup, AI Training & Widget Guides',
                        'Step-by-step guides to add the ' . $platform_name . ' widget to your site, train the AI on your documents and pages, and manage chats and leads.'],
    '/blog'         => [$platform_name . ' Blog – Live Chat & AI Support Guides',
                        'Practical guides on AI chatbots, live chat and customer support for small businesses, online stores and SaaS teams.'],
    '/privacy'      => ['Privacy Policy | ' . $platform_name, 'How ' . $platform_name . ' collects, uses and protects your data.'],
    '/terms'        => ['Terms of Service | ' . $platform_name, 'The terms that apply when you use ' . $platform_name . '.'],
    '/login'        => ['Log in | ' . $platform_name, 'Log in to your ' . $platform_name . ' dashboard.'],
    '/register'     => ['Create your free account | ' . $platform_name, 'Start with the free ' . $platform_name . ' plan. No credit card required.'],
];
if (isset($route_meta[$request_path])) {
    $seo_title = $route_meta[$request_path][0];
    $seo_desc  = $route_meta[$request_path][1];
    $og_title  = $seo_title;
    $og_desc   = $seo_desc;
}

// App screens should not be indexed
$is_app_screen = in_array($request_path, ['/login', '/register', '/widget', '/video-ad'], true)
    || $request_path === '/dashboard' || strpos($request_path, '/dashboard/') === 0
    || strpos($request_path, '/ticket/') === 0;
if ($is_app_screen) {
    $seo_robots = 'noindex, follow';
}

// Unknown URLs return a real 404 instead of a 200 copy of the homepage
$known_paths = ['/', '/index.php', '/index.html', '/login', '/register', '/widget', '/integrations',
                '/video-ad', '/help', '/privacy', '/terms', '/blog'];
$is_known = in_array($request_path, $known_paths, true)
    || $request_path === '/dashboard' || strpos($request_path, '/dashboard/') === 0
    || strpos($request_path, '/ticket/') === 0;
if (!$is_known && preg_match('#^/blog/[^/]+$#', $request_path)) {
    // Only 404 a post when the database answered and the post really doesn't exist
    $is_known = $blog_post || !isset($pdo);
}
if (!$is_known) {
    http_response_code(404);
    $seo_title  = 'Page not found | ' . $platform_name;
    $seo_desc   = 'This page does not exist.';
    $og_title   = $seo_title;
    $og_desc    = $seo_desc;
    $seo_robots = 'noindex, follow';
}

if ($blog_post) {
    $seo_title      = $blog_post['seo_title'] ?: ($blog_post['title'] . ' | ' . $platform_name);
    $seo_desc       = $blog_post['seo_description'] ?: $blog_post['summary'];
    $og_title       = $seo_title;
    $og_desc        = $seo_desc;
    if (!empty($blog_post['image_url'])) {
        $og_image   = $blog_post['image_url'];
    }
}


// Social networks need absolute image URLs
if (strpos($og_image, 'http') !== 0) {
    $og_image = $domain_base . '/' . ltrim($og_image, '/');
}

// ─── Load static index.html built by Vite ───────────────────────────
$html_path = __DIR__ . '/index.html';
if (!file_exists($html_path)) {
    echo "Site is building or index.html is missing.";
    exit;
}
$html = file_get_contents($html_path);

// ─── Perform Replacements ───────────────────────────────────────────
$html = str_replace(
    '<title>Bee Chat | AI-Powered Real-Time Customer Support Platform</title>',
    '<title>' . htmlspecialchars($seo_title) . '</title>',
    $html
);

$html = str_replace(
    '<meta name="description" content="Elevate your customer support with Bee Chat. The premium AI-driven chat platform for businesses to manage live conversations, agents, and websites in one unified hive." />',
    '<meta name="description" content="' . htmlspecialchars($seo_desc) . '" />',
    $html
);

$html = str_replace(
    '<meta name="keywords" content="AI Chat, Live Support, Customer Engagement, SaaS Chat, Bee Chat, Real-time Messaging, AI Support Agent" />',
    '<meta name="keywords" content="' . htmlspecialchars($seo_keywords) . '" />',
    $html
);

$html = str_replace(
    '<meta name="author" content="Bee Chat Team" />',
    '<meta name="author" content="' . htmlspecialchars($seo_author) . '" />',
    $html
);

$html = str_replace(
    '<meta name="robots" content="index, follow" />',
    '<meta name="robots" content="' . htmlspecialchars($seo_robots) . '" />',
    $html
);

// OG & Twitter replacements
$html = str_replace(
    '<meta property="og:title" content="Bee Chat | The Ultimate AI Chat Platform" />',
    '<meta property="og:title" content="' . htmlspecialchars($og_title) . '" />',
    $html
);

$html = str_replace(
    '<meta property="og:description" content="Manage your customer support like a colony. Fast, intelligent, and real-time AI-powered chat for modern businesses." />',
    '<meta property="og:description" content="' . htmlspecialchars($og_desc) . '" />',
    $html
);

$html = str_replace(
    '<meta property="og:url" content="https://www.beechat.online/" />',
    '<meta property="og:url" content="' . htmlspecialchars($current_canonical) . '" />',
    $html
);

$html = str_replace(
    '<meta property="og:image" content="/og-image.png" />',
    '<meta property="og:image" content="' . htmlspecialchars($og_image) . '" />',
    $html
);

$html = str_replace(
    '<meta property="twitter:url" content="https://www.beechat.online/" />',
    '<meta property="twitter:url" content="' . htmlspecialchars($current_canonical) . '" />',
    $html
);

$html = str_replace(
    '<meta property="twitter:title" content="Bee Chat | AI-Powered Customer Support" />',
    '<meta property="twitter:title" content="' . htmlspecialchars($og_title) . '" />',
    $html
);

$html = str_replace(
    '<meta property="twitter:description" content="The premium AI-driven chat platform for businesses. Real-time messaging, intelligent agents, and seamless integration." />',
    '<meta property="twitter:description" content="' . htmlspecialchars($og_desc) . '" />',
    $html
);

$html = str_replace(
    '<meta property="twitter:image" content="/og-image.png" />',
    '<meta property="twitter:image" content="' . htmlspecialchars($og_image) . '" />',
    $html
);

// Google Tag Manager replacement
$gtm_id = trim($settings['gtm_id'] ?? '');
if (!empty($gtm_id) && $gtm_id !== 'GTM-XXXXXXX') {
    $gtm_script = "<!-- Google Tag Manager -->\n" .
        "    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n" .
        "    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n" .
        "    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n" .
        "    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n" .
        "    })(window,document,'script','dataLayer','" . htmlspecialchars($gtm_id) . "');</script>\n" .
        "    <!-- End Google Tag Manager -->";
        
    $gtm_noscript = "<!-- Google Tag Manager (noscript) -->\n" .
        "    <noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id=" . htmlspecialchars($gtm_id) . "\"\n" .
        "    height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe></noscript>\n" .
        "    <!-- End Google Tag Manager (noscript) -->";
        
    $html = str_replace('<!-- Google Tag Manager Injected Dynamically -->', $gtm_script, $html);
    $html = str_replace('<!-- Google Tag Manager (noscript) Injected Dynamically -->', $gtm_noscript, $html);
} else {
    // Clean up comments if no GTM ID is set
    $html = str_replace('<!-- Google Tag Manager Injected Dynamically -->', '', $html);
    $html = str_replace('<!-- Google Tag Manager (noscript) Injected Dynamically -->', '', $html);
}

// ─── Inject GEO & JSON-LD Schema before </head> ────────────────────
$inject_head = "\n    <!-- Dynamic Canonical URL -->\n" .
    '    <link rel="canonical" href="' . htmlspecialchars($current_canonical) . "\" />\n\n" .
    "    <!-- Server-Side SEO & Geotargeting (GEO) -->\n";
if (!empty($settings['geo_region'])) {
    $inject_head .= '    <meta name="geo.region" content="' . htmlspecialchars($settings['geo_region']) . "\" />\n";
}
if (!empty($settings['geo_placename'])) {
    $inject_head .= '    <meta name="geo.placename" content="' . htmlspecialchars($settings['geo_placename']) . "\" />\n";
}
if (!empty($settings['geo_position'])) {
    $inject_head .= '    <meta name="geo.position" content="' . htmlspecialchars($settings['geo_position']) . "\" />\n";
    $inject_head .= '    <meta name="ICBM" content="' . htmlspecialchars($settings['geo_position']) . "\" />\n";
}

// Google Analytics (gtag.js) Injection
$ga_id = trim($settings['google_analytics_id'] ?? '');
if (!empty($ga_id) && $ga_id !== 'G-XXXXXXXXXX') {
    $inject_head .= "\n    <!-- Google tag (gtag.js) -->\n";
    $inject_head .= "    <script async src=\"https://www.googletagmanager.com/gtag/js?id=" . htmlspecialchars($ga_id) . "\"></script>\n";
    $inject_head .= "    <script>\n";
    $inject_head .= "      window.dataLayer = window.dataLayer || [];\n";
    $inject_head .= "      function gtag(){dataLayer.push(arguments);}\n";
    $inject_head .= "      gtag('js', new Date());\n";
    $inject_head .= "      gtag('config', '" . htmlspecialchars($ga_id) . "');\n";
    $inject_head .= "    </script>\n";
}

// ─── JSON-LD structured data ────────────────────────────────────────
// No aggregateRating: ratings may only be marked up when real reviews are
// shown on the page. Add one back only when verifiable reviews exist.
$site_url = $domain_base . '/';
$org_id   = $site_url . '#organization';
$entity_description = $platform_name . ' is an AI chatbot and live chat widget for websites. It answers visitor questions from the business\'s own documents and web pages, and hands conversations to human agents when needed.';

$organization = [
    "@type" => "Organization",
    "@id" => $org_id,
    "name" => $platform_name,
    "url" => $site_url,
    "logo" => $site_url . "logo.png",
    "description" => $entity_description,
    "email" => $settings['support_email'] ?? 'info@beechat.online'
];

$graph = [$organization];
$offers = [];

if ($blog_post) {
    // Blog posts: article + breadcrumb schema only
    $post_date = $blog_post['published_at'] ?: $blog_post['created_at'];
    $article = [
        "@type" => "BlogPosting",
        "@id" => $current_canonical . "#article",
        "headline" => mb_substr($blog_post['title'], 0, 110),
        "description" => $seo_desc,
        "url" => $current_canonical,
        "mainEntityOfPage" => $current_canonical,
        "image" => $og_image,
        "author" => ["@type" => "Person", "name" => $blog_post['author'] ?: ($platform_name . ' Team')],
        "publisher" => ["@id" => $org_id]
    ];
    if ($post_date) {
        $article["datePublished"] = date('c', strtotime($post_date));
    }
    $graph[] = $article;
    $graph[] = [
        "@type" => "BreadcrumbList",
        "itemListElement" => [
            ["@type" => "ListItem", "position" => 1, "name" => "Home", "item" => $site_url],
            ["@type" => "ListItem", "position" => 2, "name" => "Blog", "item" => $domain_base . "/blog"],
            ["@type" => "ListItem", "position" => 3, "name" => $blog_post['title'], "item" => $current_canonical]
        ]
    ];
} elseif ($request_path === '/') {
    // Homepage: website + software product with one Offer per real plan
    if ($config_path && isset($pdo)) {
        try {
            $rows = $pdo->query("SELECT name, price FROM plans ORDER BY price ASC")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $r) {
                $offers[] = [
                    "@type" => "Offer",
                    "name" => $r['name'],
                    "price" => number_format((float)$r['price'], 2, '.', ''),
                    "priceCurrency" => $settings['platform_currency'] ?? 'USD',
                    "url" => $site_url . "#pricing"
                ];
            }
        } catch (Exception $e) {
            $offers = [];
        }
    }
    $app_schema = [
        "@type" => "SoftwareApplication",
        "name" => $platform_name,
        "url" => $site_url,
        "applicationCategory" => "BusinessApplication",
        "applicationSubCategory" => "Live chat and AI chatbot software",
        "operatingSystem" => "Web",
        "description" => $entity_description,
        "featureList" => [
            "AI chatbot trained on your own documents and web pages",
            "Live chat with human agent takeover",
            "Lead capture and chat history",
            "Helpdesk tickets",
            "Manage multiple websites from one dashboard"
        ],
        "publisher" => ["@id" => $org_id]
    ];
    if (count($offers) > 0) {
        $app_schema["offers"] = $offers;
    }
    $graph[] = [
        "@type" => "WebSite",
        "@id" => $site_url . "#website",
        "url" => $site_url,
        "name" => $platform_name,
        "publisher" => ["@id" => $org_id]
    ];
    $graph[] = $app_schema;

    // FAQ schema only on the homepage, where the FAQ section is shown
    $faq_list = json_decode($settings['aeo_faq_json'] ?? '', true);
    if (is_array($faq_list) && count($faq_list) > 0) {
        $faq_schema = ["@type" => "FAQPage", "mainEntity" => []];
        foreach ($faq_list as $item) {
            if (empty($item['q']) || empty($item['a'])) continue;
            $faq_schema['mainEntity'][] = [
                "@type" => "Question",
                "name" => $item['q'],
                "acceptedAnswer" => ["@type" => "Answer", "text" => $item['a']]
            ];
        }
        if (count($faq_schema['mainEntity']) > 0) {
            $graph[] = $faq_schema;
        }
    }
}

$schema = ["@context" => "https://schema.org", "@graph" => $graph];
$inject_head .= "    <script type=\"application/ld+json\">\n    " . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n    </script>\n";

$html = str_replace('</head>', $inject_head . '</head>', $html);

// ─── Server-rendered body content ───────────────────────────────────
// Crawlers that don't run JavaScript (GPTBot, ClaudeBot, PerplexityBot...)
// otherwise see an empty <div id="root">. React's createRoot() replaces this
// markup as soon as the app loads, so visitors see the normal page.
$prerender = '';
$esc = function ($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); };
$wrap_style = 'max-width:820px;margin:0 auto;padding:40px 20px;font-family:Inter,system-ui,sans-serif;line-height:1.7;color:#334155';
if ($blog_post) {
    $post_date = $blog_post['published_at'] ?: $blog_post['created_at'];
    $prerender = '<article style="' . $wrap_style . '">'
        . '<p><a href="/">' . $esc($platform_name) . '</a> › <a href="/blog">Blog</a></p>'
        . '<h1>' . $esc($blog_post['title']) . '</h1>'
        . '<p>By ' . $esc($blog_post['author'] ?: ($platform_name . ' Team'))
        . ($post_date ? ' · <time datetime="' . $esc(date('Y-m-d', strtotime($post_date))) . '">' . $esc(date('F j, Y', strtotime($post_date))) . '</time>' : '')
        . '</p>'
        . $blog_post['content'] // HTML authored by admins in the blog editor (already rendered as HTML by the React app)
        . '</article>';
} elseif ($request_path === '/') {
    $prerender = '<main style="' . $wrap_style . '">'
        . '<h1>AI chatbot and live chat for your website</h1>'
        . '<p>' . $esc($entity_description) . '</p>'
        . '<h2>How it works</h2><ol>'
        . '<li>Create a free account and add your website.</li>'
        . '<li>Train the AI by uploading PDFs or Word files, adding page URLs or pasting text.</li>'
        . '<li>Paste one script tag into your site. It works with WordPress, Shopify, WooCommerce and any HTML site.</li>'
        . '<li>Watch conversations live and take over from the dashboard whenever a person should answer.</li></ol>';
    if (!empty($offers)) {
        $prerender .= '<h2>Pricing</h2><ul>';
        foreach ($offers as $o) {
            $prerender .= '<li>' . $esc($o['name']) . ': $' . $esc(rtrim(rtrim($o['price'], '0'), '.')) . ' per month</li>';
        }
        $prerender .= '</ul>';
    }
    $faq_list = json_decode($settings['aeo_faq_json'] ?? '', true);
    if (is_array($faq_list) && count($faq_list) > 0) {
        $prerender .= '<h2>Frequently asked questions</h2>';
        foreach ($faq_list as $item) {
            if (empty($item['q']) || empty($item['a'])) continue;
            $prerender .= '<h3>' . $esc($item['q']) . '</h3><p>' . $esc($item['a']) . '</p>';
        }
    }
    $prerender .= '<p><a href="/register">Start free</a> · <a href="/integrations">Integrations</a> · <a href="/help">Help center</a> · <a href="/blog">Blog</a></p></main>';
}
if ($prerender !== '') {
    $html = str_replace('<div id="root"></div>', '<div id="root">' . $prerender . '</div>', $html);
}


echo $html;
?>
