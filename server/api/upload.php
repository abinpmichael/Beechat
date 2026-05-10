<?php
// server/api/upload.php
require_once 'config.php';

// Allow cross-origin uploads
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

if (!isset($_FILES['file'])) {
    http_response_code(400); echo json_encode(["error" => "No file uploaded"]); exit;
}

$file = $_FILES['file'];
$ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];

if (!in_array(strtolower($ext), $allowed)) {
    http_response_code(400); echo json_encode(["error" => "Invalid file type"]); exit;
}

// Ensure uploads directory exists
$uploadDir = '../uploads/';
if (!is_dir($uploadDir)) { mkdir($uploadDir, 0777, true); }

$newName = md5(time() . $file['name']) . '.' . $ext;
$target  = $uploadDir . $newName;

if (move_uploaded_file($file['tmp_name'], $target)) {
    // Return the relative URL from the server root
    $baseUrl = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]/Bee/server/uploads/";
    echo json_encode(["url" => $baseUrl . $newName]);
} else {
    http_response_code(500); echo json_encode(["error" => "Upload failed"]);
}
?>
