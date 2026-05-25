<?php
// Root index.php to pre-render SEO/AEO/GEO tags server-side
$config_path = __DIR__ . '/server/api/config.php';
$settings = [];

if (file_exists($config_path)) {
    try {
        // Prevent config.php from sending API JSON headers
        define('HTML_RESPONSE', true);
        require_once $config_path;
        
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN (
            'platform_name', 'seo_title', 'seo_description', 'seo_keywords', 'seo_canonical_url', 'seo_author', 'seo_robots',
            'og_title', 'og_description', 'og_image', 'twitter_handle', 'geo_region', 'geo_placename', 'geo_position', 'aeo_faq_json', 'gtm_id'
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

// Ensure canonical URL is slash-terminated
$seo_canonical  = rtrim($seo_canonical, '/') . '/';

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
    '<meta property="og:url" content="' . htmlspecialchars($seo_canonical) . '" />',
    $html
);

$html = str_replace(
    '<meta property="og:image" content="/og-image.png" />',
    '<meta property="og:image" content="' . htmlspecialchars($og_image) . '" />',
    $html
);

$html = str_replace(
    '<meta property="twitter:url" content="https://www.beechat.online/" />',
    '<meta property="twitter:url" content="' . htmlspecialchars($seo_canonical) . '" />',
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
$gtm_id = $settings['gtm_id'] ?? '';
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
$inject_head = "\n    <!-- Server-Side SEO & Geotargeting (GEO) -->\n";
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

// Query plans table dynamically to construct AggregateOffer
$offers = null;
if (file_exists($config_path) && isset($pdo)) {
    try {
        $stmt = $pdo->query("SELECT price FROM plans ORDER BY price ASC");
        $prices = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (count($prices) > 0) {
            $offers = [
                "@type" => "AggregateOffer",
                "priceCurrency" => $settings['platform_currency'] ?? 'USD',
                "lowPrice" => number_format((float)$prices[0], 2, '.', ''),
                "highPrice" => number_format((float)end($prices), 2, '.', ''),
                "offerCount" => count($prices)
            ];
        }
    } catch (Exception $e) {
        // Fallback silently
    }
}

// Fallback offers if dynamic query returns nothing
if (!$offers) {
    $offers = [
        "@type" => "AggregateOffer",
        "priceCurrency" => $settings['platform_currency'] ?? 'USD',
        "lowPrice" => "0.00",
        "highPrice" => "99.00",
        "offerCount" => "4"
    ];
}

$app_schema = [
    "@type" => "SoftwareApplication",
    "name" => $platform_name,
    "applicationCategory" => "BusinessApplication",
    "operatingSystem" => "All",
    "description" => $seo_desc,
    "offers" => $offers,
    "aggregateRating" => [
        "@type" => "AggregateRating",
        "ratingValue" => "4.9",
        "ratingCount" => "185",
        "bestRating" => "5",
        "worstRating" => "1"
    ]
];

// JSON-LD Schema (GEO, Organization, Software & FAQ Page Schema)
$schema = [
    "@context" => "https://schema.org",
    "@graph" => [
        $app_schema,
        [
            "@type" => "Organization",
            "name" => $platform_name,
            "url" => $seo_canonical,
            "logo" => $seo_canonical . "logo.png"
        ]
    ]
];

$faq_json = $settings['aeo_faq_json'] ?? '';
if (!empty($faq_json)) {
    $faq_list = json_decode($faq_json, true);
    if (is_array($faq_list) && count($faq_list) > 0) {
        $faq_schema = [
            "@type" => "FAQPage",
            "mainEntity" => []
        ];
        foreach ($faq_list as $item) {
            $faq_schema['mainEntity'][] = [
                "@type" => "Question",
                "name" => $item['q'],
                "acceptedAnswer" => [
                    "@type" => "Answer",
                    "text" => $item['a']
                ]
            ];
        }
        $schema['@graph'][] = $faq_schema;
    }
}
$inject_head .= "    <script type=\"application/ld+json\">\n    " . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n    </script>\n";

$html = str_replace('</head>', $inject_head . '</head>', $html);

echo $html;
?>
