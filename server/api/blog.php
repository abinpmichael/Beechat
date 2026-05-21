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
            $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = ? AND status = 'published' LIMIT 1");
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
        $stmt = $pdo->query("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC");
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

            $stmt = $pdo->prepare("INSERT INTO blog_posts (title, slug, summary, content, image_url, status, author, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['title'],
                $data['slug'],
                $data['summary'],
                $data['content'],
                $imageUrl,
                $status,
                $author,
                $seoTitle,
                $seoDescription
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

            $stmt = $pdo->prepare("UPDATE blog_posts SET title = ?, slug = ?, summary = ?, content = ?, image_url = ?, status = ?, author = ?, seo_title = ?, seo_description = ? WHERE id = ?");
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
