<?php
// server/api/config.php
if (php_sapi_name() !== 'cli') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: *");
    header("Access-Control-Allow-Methods: *");
    header("Content-Type: application/json");

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

$host = 'localhost';
$db   = 'bee_chat';
$user = 'root';
$pass = ''; // Default XAMPP password is empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     http_response_code(500);
     echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
     exit;
}

// ─── Shared Auth Helpers (available to ALL API files) ──────────────────────
if (!function_exists('getAuthHeaders')) {
    function getAuthHeaders() {
        if (function_exists('getallheaders')) return getallheaders();
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) === 'HTTP_') {
                $key = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
                $headers[$key] = $value;
            }
        }
        return $headers;
    }
}

if (!function_exists('getBearerToken')) {
    function getBearerToken() {
        $headers = getAuthHeaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $auth, $m)) return $m[1];
        return null;
    }
}

if (!function_exists('decodeJwt')) {
    function decodeJwt($input) {
        if (!$input) return null;
        
        $token = $input;
        if (is_array($input)) {
            $auth = $input['Authorization'] ?? $input['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
            if (preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
                $token = $m[1];
            } else {
                // If no Bearer, it might be the raw token in the header or just invalid
                return null;
            }
        }

        if (strpos($token, '.') !== false) {
            $parts = explode('.', $token);
            if (count($parts) < 2) return null;
            $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
        } else {
            $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $token));
        }
        return json_decode($payload, true);
    }
}

?>
