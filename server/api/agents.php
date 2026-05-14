<?php
// server/api/agents.php - Get all agents for the same tenant (for transfer)
require_once 'config.php';

$headers = getAuthHeaders();
$decoded = decodeJwt($headers);

if (!$decoded || !isset($decoded['tenant_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized or Invalid token"]);
    exit;
}

$tenantId    = (int)$decoded['tenant_id'];
$currentUserId = (int)($decoded['id'] ?? 0);

try {
    // Return all agents in the same tenant EXCEPT the current user
    $stmt = $pdo->prepare(
        "SELECT id, name, email, role FROM users WHERE tenant_id = ? AND id != ? ORDER BY name ASC"
    );
    $stmt->execute([$tenantId, $currentUserId]);
    echo json_encode($stmt->fetchAll());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
