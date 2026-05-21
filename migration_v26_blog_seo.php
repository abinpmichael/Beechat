<?php
require_once 'server/api/config.php';

try {
    echo "Starting Blog SEO V26 Migration...\n";

    // Add seo_title if it does not exist
    $cols = $pdo->query("SHOW COLUMNS FROM blog_posts LIKE 'seo_title'")->fetchAll();
    if (empty($cols)) {
        $pdo->exec("ALTER TABLE blog_posts ADD COLUMN seo_title VARCHAR(255) DEFAULT NULL;");
        echo "Added 'seo_title' column.\n";
    } else {
        echo "'seo_title' column already exists.\n";
    }

    // Add seo_description if it does not exist
    $colsDesc = $pdo->query("SHOW COLUMNS FROM blog_posts LIKE 'seo_description'")->fetchAll();
    if (empty($colsDesc)) {
        $pdo->exec("ALTER TABLE blog_posts ADD COLUMN seo_description VARCHAR(500) DEFAULT NULL;");
        echo "Added 'seo_description' column.\n";
    } else {
        echo "'seo_description' column already exists.\n";
    }

    echo "SUCCESS: Blog SEO migration applied successfully.\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
