<?php
// server/api/team.php — full team management for a tenant
require_once 'config.php';

$method  = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
$auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (empty($auth) || !preg_match('/Bearer\s+(.*)$/i', $auth, $m)) {
    http_response_code(401); echo json_encode(["error"=>"Unauthorized"]); exit;
}
$decoded  = json_decode(base64_decode($m[1]), true);
$tenantId = (int)($decoded['tenant_id'] ?? 0);
$myId     = (int)($decoded['id']        ?? 0);
$myRole   = $decoded['role']            ?? 'agent';

// Only admins can manage team
if ($method !== 'GET' && $myRole !== 'admin') {
    http_response_code(403); echo json_encode(["error"=>"Admin access required"]); exit;
}

/* ── GET: list all team members ───────────────────────────── */
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT id, name, email, role, created_at FROM users WHERE tenant_id=? ORDER BY role DESC, name ASC");
        $stmt->execute([$tenantId]);
        echo json_encode($stmt->fetchAll());
    } catch (Exception $e) {
        http_response_code(500); echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$action = $data['action'] ?? '';

/* ── POST: invite new agent ───────────────────────────────── */
if ($method === 'POST' && $action === 'invite') {
    $name     = trim($data['name']     ?? '');
    $email    = strtolower(trim($data['email'] ?? ''));
    $role     = in_array($data['role'] ?? '', ['admin','agent']) ? $data['role'] : 'agent';
    $password = $data['password'] ?? 'Bee@' . rand(1000,9999); // temp password

    if (!$name || !$email) {
        http_response_code(400); echo json_encode(["error"=>"Name and email are required"]); exit;
    }

    // Check duplicate
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email=?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409); echo json_encode(["error"=>"Email already registered"]); exit;
    }

    // --- Improved Plan Limit Check ---
    // 1. Get current agent count
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE tenant_id = ?");
    $countStmt->execute([$tenantId]);
    $currentCount = $countStmt->fetchColumn();

    // 2. Get plan limit
    $planStmt = $pdo->prepare("
        SELECT p.max_agents 
        FROM tenants t 
        JOIN plans p ON t.plan_id = p.id 
        WHERE t.id = ?
    ");
    $planStmt->execute([$tenantId]);
    $maxAgents = $planStmt->fetchColumn() ?: 2; // Default to 2 if no plan found

    if ($currentCount >= $maxAgents) {
        http_response_code(403);
        echo json_encode(["error" => "Plan limit reached ($maxAgents agents). Please upgrade to invite more."]);
        exit;
    }
    // -------------------------

    try {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (tenant_id, name, email, password, role) VALUES (?,?,?,?,?)");
        $stmt->execute([$tenantId, $name, $email, $hash, $role]);
        echo json_encode(["status"=>"invited", "id"=>$pdo->lastInsertId(), "temp_password"=>$password]);
    } catch (Exception $e) {
        http_response_code(500); echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

/* ── PUT: update role ─────────────────────────────────────── */
if ($method === 'PUT') {
    $targetId = (int)($data['id'] ?? 0);
    $newRole  = in_array($data['role'] ?? '', ['admin','agent']) ? $data['role'] : 'agent';

    if ($targetId === $myId) {
        http_response_code(400); echo json_encode(["error"=>"Cannot change your own role"]); exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE users SET role=? WHERE id=? AND tenant_id=?");
        $stmt->execute([$newRole, $targetId, $tenantId]);
        echo json_encode(["status"=>"updated"]);
    } catch (Exception $e) {
        http_response_code(500); echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

/* ── DELETE: remove agent ─────────────────────────────────── */
if ($method === 'DELETE') {
    $targetId = (int)($data['id'] ?? $_GET['id'] ?? 0);

    if ($targetId === $myId) {
        http_response_code(400); echo json_encode(["error"=>"Cannot remove yourself"]); exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id=? AND tenant_id=?");
        $stmt->execute([$targetId, $tenantId]);
        echo json_encode(["status"=>"removed"]);
    } catch (Exception $e) {
        http_response_code(500); echo json_encode(["error"=>$e->getMessage()]);
    }
    exit;
}

http_response_code(405); echo json_encode(["error"=>"Method not allowed"]);
?>
