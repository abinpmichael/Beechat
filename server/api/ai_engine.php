<?php
// server/api/ai_engine.php
require_once 'config.php';

class AIEngine {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getResponse($tenantId, $websiteId, $userMessage) {
        // 1. Check if OpenAI is configured
        $stmt = $this->pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = 'openai_api_key'");
        $stmt->execute();
        $openAiKey = $stmt->fetchColumn();

        // 2. Fetch Knowledge Base Context
        // We get top 3 articles matching the query to provide to GPT
        // Strip punctuation to clean search keywords
        $cleanMessage = preg_replace('/[^\w\s]/', '', $userMessage);
        $words = explode(' ', strtolower($cleanMessage));
        $searchTerms = array_filter($words, function($w) { return strlen($w) > 2; });
        
        $context = "";
        if (!empty($searchTerms)) {
            $query = "SELECT title, content FROM knowledge_base WHERE ((tenant_id = ? AND website_id = ?) OR (tenant_id = 0 AND website_id = 0) OR (tenant_id IS NULL AND website_id IS NULL)) AND (";
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

        // 3. GPT Fallback if context is found but key is missing
        if (empty($openAiKey)) {
            if (!empty($context)) {
                // Return exact match
                return $results[0]['content'];
            }
            return null;
        }

        // 4. OpenAI GPT Generation
        $systemPrompt = "You are a helpful customer support agent. Use the following context from the company's knowledge base to answer the user's question. If the answer is not in the context, do not make up an answer, simply state that you don't know and a human agent will assist them shortly.\n\nContext:\n$context";

        $data = [
            "model" => "gpt-3.5-turbo",
            "messages" => [
                ["role" => "system", "content" => $systemPrompt],
                ["role" => "user", "content" => $userMessage]
            ],
            "max_tokens" => 150,
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

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || $curlError) {
            // OpenAI request failed – fallback to first knowledge‑base result if available
            if (!empty($results)) {
                return $results[0]['content'];
            }
            return null;
        }

        $json = json_decode($response, true);

        if (isset($json['choices'][0]['message']['content'])) {
            return trim($json['choices'][0]['message']['content']);
        }

        // If OpenAI returned no content, fallback to knowledge base if we have data
        if (!empty($results)) {
            return $results[0]['content'];
        }

        return null;
    }
}
?>
