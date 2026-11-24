<?php
// server/api/usage.php — monthly AI conversation usage per tenant
//
// An "AI conversation" is a chat (lead) that received at least one AI reply
// during the current calendar month. The limit comes from
// plans.max_chats_per_month; 0 or NULL means unlimited.

if (!function_exists('getAiConversationUsage')) {
    function getAiConversationUsage(PDO $pdo, $tenantId) {
        $limit = 0;
        try {
            $stmt = $pdo->prepare("SELECT p.max_chats_per_month FROM tenants t JOIN plans p ON t.plan_id = p.id WHERE t.id = ?");
            $stmt->execute([$tenantId]);
            $limit = (int)$stmt->fetchColumn();
        } catch (Exception $e) {
            $limit = 0; // column/plan missing: treat as unlimited rather than blocking chats
        }

        $stmt = $pdo->prepare("
            SELECT COUNT(DISTINCT m.lead_id)
            FROM messages m
            JOIN leads l ON l.id = m.lead_id
            WHERE l.tenant_id = ?
              AND m.agent_name = 'AI Bot'
              AND m.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
        ");
        $stmt->execute([$tenantId]);
        $used = (int)$stmt->fetchColumn();

        return ['used' => $used, 'limit' => $limit];
    }
}

if (!function_exists('aiLimitAllowsLead')) {
    // True when the AI may answer this lead: unlimited plan, under the limit,
    // or the lead already had an AI reply this month (never cut a chat mid-way).
    function aiLimitAllowsLead(PDO $pdo, $tenantId, $leadId) {
        $usage = getAiConversationUsage($pdo, $tenantId);
        if ($usage['limit'] <= 0 || $usage['used'] < $usage['limit']) {
            return true;
        }
        $stmt = $pdo->prepare("SELECT 1 FROM messages WHERE lead_id = ? AND agent_name = 'AI Bot' AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') LIMIT 1");
        $stmt->execute([$leadId]);
        return (bool)$stmt->fetchColumn();
    }
}
?>
