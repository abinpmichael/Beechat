<?php
// server/api/ai_engine.php
require_once 'config.php';

class AIEngine {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getResponse($tenantId, $websiteId, $userMessage) {
        // 1. Search Knowledge Base for keywords
        // In a production app, you would use Vector Search (Embeddings).
        // For now, we use a robust SQL keyword search.
        
        $words = explode(' ', strtolower($userMessage));
        $searchTerms = array_filter($words, function($w) { return strlen($w) > 2; });
        
        if (empty($searchTerms)) return null;

        $query = "SELECT content FROM knowledge_base WHERE tenant_id = ? AND website_id = ? AND (";
        $params = [$tenantId, $websiteId];
        
        $conditions = [];
        foreach ($searchTerms as $term) {
            $conditions[] = "(title LIKE ? OR content LIKE ?)";
            $params[] = "%$term%";
            $params[] = "%$term%";
        }
        $query .= implode(' OR ', $conditions) . ") LIMIT 1";

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return $result['content'];
        }

        return null; // No confident answer found
    }
}
?>
