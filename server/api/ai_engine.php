<?php
// server/api/ai_engine.php
require_once 'config.php';

class AIEngine {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getResponse($tenantId, $websiteId, $userMessage) {
        // 1. Get OpenAI API key from platform_settings
        $stmt = $this->pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'openai_api_key'");
        $stmt->execute();
        $openAiKey = $stmt->fetchColumn();

        // 2. Fetch Knowledge Base Context (top 5 matching articles)
        $cleanMessage = preg_replace('/[^\w\s]/', '', $userMessage);
        $words = explode(' ', strtolower($cleanMessage));
        $searchTerms = array_filter($words, function($w) { return strlen($w) > 2; });
        
        $context = "";
        $results = [];
        if (!empty($searchTerms)) {
            $query = "SELECT title, content FROM knowledge_base WHERE (
                (tenant_id = ? AND website_id = ?) OR 
                (tenant_id IS NULL AND website_id IS NULL)
            ) AND (";
            $params = [$tenantId, $websiteId];
            
            $conditions = [];
            foreach ($searchTerms as $term) {
                $conditions[] = "(title LIKE ? OR content LIKE ?)";
                $params[] = "%$term%";
                $params[] = "%$term%";
            }
            $query .= implode(' OR ', $conditions) . ") LIMIT 5";

            $stmt = $this->pdo->prepare($query);
            $stmt->execute($params);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($results as $res) {
                $context .= "Q: " . $res['title'] . "\nA: " . $res['content'] . "\n\n";
            }
        }

        // 3. If no OpenAI key, return first KB match or null
        if (empty($openAiKey)) {
            error_log("AI Engine: No OpenAI API key configured in platform_settings.");
            if (!empty($results)) {
                return $results[0]['content'];
            }
            return null;
        }

        // 4. Build system prompt
        if (!empty($context)) {
            $systemPrompt = "You are a helpful customer support assistant. Use the following knowledge base to answer the user's question accurately and concisely. If the answer is not in the knowledge base, give a helpful general response and let them know a human agent will assist shortly.\n\nKnowledge Base:\n" . $context;
        } else {
            $systemPrompt = "You are a helpful customer support assistant. Answer the user's question as helpfully as possible. If you cannot fully answer, let them know a human agent will be with them shortly.";
        }

        // 5. Call OpenAI API
        $data = [
            "model" => "gpt-3.5-turbo",
            "messages" => [
                ["role" => "system", "content" => $systemPrompt],
                ["role" => "user", "content" => $userMessage]
            ],
            "max_tokens" => 300,
            "temperature" => 0.5
        ];

        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $openAiKey
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false || $curlError) {
            error_log("AI Engine cURL error: " . $curlError);
            if (!empty($results)) return $results[0]['content'];
            return null;
        }

        $json = json_decode($response, true);

        // Log API errors for debugging
        if (isset($json['error'])) {
            $errMsg = $json['error']['message'] ?? 'Unknown error';
            $errType = $json['error']['type'] ?? '';
            if ($httpCode === 401) {
                error_log("AI Engine: Invalid OpenAI API key. Please update it in Super Admin → Settings. Error: $errMsg");
            } elseif ($httpCode === 429) {
                error_log("AI Engine: OpenAI rate limit or quota exceeded. Error: $errMsg");
            } else {
                error_log("AI Engine OpenAI error (HTTP $httpCode, type=$errType): $errMsg");
            }
            if (!empty($results)) return $results[0]['content'];
            return null;
        }

        if (isset($json['choices'][0]['message']['content'])) {
            return trim($json['choices'][0]['message']['content']);
        }

        // Fallback to KB if OpenAI returned nothing useful
        if (!empty($results)) {
            return $results[0]['content'];
        }

        return null;
    }
}
?>
