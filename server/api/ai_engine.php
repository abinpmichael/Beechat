<?php
// server/api/ai_engine.php
require_once 'config.php';

class AIEngine {
    private $pdo;

    // Tried in order when a model is unknown/retired for this API key.
    // A SuperAdmin can put a preferred model first via platform_settings.openai_model.
    const FALLBACK_MODELS = ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-3.5-turbo'];
    const MAX_CONTEXT_CHARS = 12000; // total knowledge text sent per question
    const MAX_ITEM_CHARS    = 3000;  // per knowledge item
    const HISTORY_MESSAGES  = 8;     // earlier chat turns sent for follow-ups

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Answer a visitor message from the website's knowledge base.
     * Returns the reply text, or null when the AI is unavailable (chat.php then
     * sends its normal bot reply instead of a wrong one).
     */
    public function getResponse($tenantId, $websiteId, $userMessage, $leadId = null) {
        $openAiKey = $this->setting('openai_api_key');
        if (empty($openAiKey)) {
            $this->recordError('No OpenAI API key configured (SuperAdmin -> Settings).');
            return $this->smartFallback($userMessage);
        }

        $history = $leadId ? $this->history($leadId, $userMessage) : [];

        // Retrieval query: this message plus the previous visitor message, so
        // short follow-ups ("and the Pro plan?") still find the right topic.
        $query = $userMessage;
        for ($i = count($history) - 1; $i >= 0; $i--) {
            if ($history[$i]['role'] === 'user') { $query .= ' ' . $history[$i]['content']; break; }
        }
        $context = $this->retrieve($tenantId, $websiteId, $query);

        $systemPrompt = "You are the customer support assistant for this website, chatting with a visitor in a small chat widget.\n"
            . "Rules:\n"
            . "- Answer from the KNOWLEDGE below. Pick only the parts relevant to the question; never paste a whole article.\n"
            . "- If the knowledge does not cover the question, say you are not sure and that a human agent will follow up. Do not invent prices, policies, links or features.\n"
            . "- Keep replies short (2-5 sentences or a short list), plain text, in the visitor's language.\n";
        $systemPrompt .= $context !== ''
            ? "\nKNOWLEDGE:\n" . $context
            : "\nKNOWLEDGE: (none available for this website)\n";

        $messages = array_merge(
            [["role" => "system", "content" => $systemPrompt]],
            $history,
            [["role" => "user", "content" => $userMessage]]
        );

        $result = $this->callOpenAI($openAiKey, $messages);
        if ($result['ok']) {
            $this->recordError('');
            return $result['text'];
        }
        $this->recordError($result['error']);
        return null;
    }

    /** Used by the SuperAdmin test page: makes a real, tiny API call. */
    public function checkConnection() {
        $key = $this->setting('openai_api_key');
        if (empty($key)) return ['ok' => false, 'message' => 'OpenAI API key not set'];
        $r = $this->callOpenAI($key, [["role" => "user", "content" => "Reply with: OK"]], 5);
        $this->recordError($r['ok'] ? '' : $r['error']);
        return $r['ok']
            ? ['ok' => true, 'message' => 'OpenAI reachable (model ' . $r['model'] . ')']
            : ['ok' => false, 'message' => $r['error']];
    }

    // ── Retrieval ───────────────────────────────────────────────

    private function retrieve($tenantId, $websiteId, $query) {
        $sql = "SELECT title, content, tenant_id FROM knowledge_base
                WHERE ((tenant_id = ? AND (website_id = ? OR website_id IS NULL))
                       OR (tenant_id IS NULL AND website_id IS NULL))";
        try {
            $stmt = $this->pdo->prepare($sql . " AND COALESCE(is_active, 1) = 1 ORDER BY id DESC LIMIT 500");
            $stmt->execute([$tenantId, $websiteId]);
        } catch (Exception $e) { // older schema without is_active
            $stmt = $this->pdo->prepare($sql . " ORDER BY id DESC LIMIT 500");
            $stmt->execute([$tenantId, $websiteId]);
        }
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (!$rows) return '';

        $terms = $this->terms($query);
        $scored = [];
        foreach ($rows as $i => $row) {
            $title = mb_strtolower($row['title'] ?? '');
            $body  = mb_strtolower($row['content'] ?? '');
            $score = 0;
            foreach ($terms as $t) {
                if (mb_strpos($title, $t) !== false) $score += 3;
                $score += min(substr_count($body, $t), 5);
            }
            // The website's own knowledge wins ties over platform-wide items.
            if (!empty($row['tenant_id'])) $score += 0.5;
            $scored[] = ['score' => $score, 'i' => $i, 'row' => $row];
        }
        usort($scored, function ($a, $b) {
            return $b['score'] <=> $a['score'] ?: $a['i'] <=> $b['i'];
        });

        $context = '';
        foreach ($scored as $s) {
            if ($s['score'] < 1 && $context !== '') break; // only relevant items after the first
            $text = trim($s['row']['content']);
            if (mb_strlen($text) > self::MAX_ITEM_CHARS) $text = mb_substr($text, 0, self::MAX_ITEM_CHARS) . '...';
            $chunk = "### " . $s['row']['title'] . "\n" . $text . "\n\n";
            if (mb_strlen($context) + mb_strlen($chunk) > self::MAX_CONTEXT_CHARS) {
                if ($context === '') $context = mb_substr($chunk, 0, self::MAX_CONTEXT_CHARS);
                break;
            }
            $context .= $chunk;
        }
        return $context;
    }

    private function terms($text) {
        static $stop = ['the','and','for','are','you','your','what','how','does','can','with','this','that','have','from','about','there','will','would','could','should','into','just','any','our','its','was','but','not','all','get','use','may','who','why','when','where','which','much','many','is','it','to','of','in','on','a','an','do','i','me','my','we','be','or','if','so','at','by','as'];
        $words = preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY);
        $out = [];
        foreach ($words as $w) {
            if (mb_strlen($w) < 3 || in_array($w, $stop, true)) continue;
            // crude stemming so "plans"/"plan", "pricing"/"price" match
            $w = preg_replace('/(ing|es|s)$/u', '', $w);
            if (mb_strlen($w) >= 3) $out[$w] = true;
        }
        return array_keys($out);
    }

    // ── Conversation history ───────────────────────────────────

    private function history($leadId, $currentMessage) {
        try {
            $stmt = $this->pdo->prepare("SELECT sender_type, content FROM messages WHERE lead_id = ? ORDER BY id DESC LIMIT " . (self::HISTORY_MESSAGES + 1));
            $stmt->execute([$leadId]);
            $rows = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            return [];
        }
        // chat.php saves the visitor message before calling us: drop that copy.
        $last = end($rows);
        if ($last && $last['sender_type'] === 'visitor' && trim($last['content']) === trim($currentMessage)) {
            array_pop($rows);
        }
        $out = [];
        foreach ($rows as $r) {
            $content = trim((string)$r['content']);
            if ($content === '') continue;
            $out[] = [
                'role'    => $r['sender_type'] === 'visitor' ? 'user' : 'assistant',
                'content' => mb_substr($content, 0, 1500),
            ];
        }
        return array_slice($out, -self::HISTORY_MESSAGES);
    }

    // ── OpenAI call with model fallback ────────────────────────

    private function callOpenAI($key, $messages, $maxTokens = 350) {
        $models = self::FALLBACK_MODELS;
        $preferred = trim((string)$this->setting('openai_model'));
        if ($preferred !== '') array_unshift($models, $preferred);
        $models = array_values(array_unique($models));

        $lastError = 'Unknown error';
        foreach ($models as $model) {
            $ch = curl_init('https://api.openai.com/v1/chat/completions');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode([
                    "model"       => $model,
                    "messages"    => $messages,
                    "max_tokens"  => $maxTokens,
                    "temperature" => 0.3,
                ]),
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Authorization: Bearer ' . $key],
                CURLOPT_TIMEOUT        => 25,
            ]);
            $response  = curl_exec($ch);
            $curlError = curl_error($ch);
            $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($response === false || $curlError) {
                return ['ok' => false, 'error' => "Network error reaching OpenAI: $curlError"];
            }
            $json = json_decode($response, true);
            if (isset($json['choices'][0]['message']['content'])) {
                return ['ok' => true, 'text' => trim($json['choices'][0]['message']['content']), 'model' => $model];
            }

            $msg  = $json['error']['message'] ?? ('Unexpected response (HTTP ' . $httpCode . ')');
            $code = $json['error']['code'] ?? '';
            $lastError = "OpenAI HTTP $httpCode" . ($code ? " ($code)" : '') . " with model $model: $msg";
            error_log("AI Engine: " . $lastError);

            $modelProblem = $httpCode === 404 || $code === 'model_not_found'
                || stripos($msg, 'model') !== false && (stripos($msg, 'does not exist') !== false || stripos($msg, 'deprecated') !== false || stripos($msg, 'access') !== false);
            if (!$modelProblem) break; // bad key, quota, rate limit: another model won't help
        }
        return ['ok' => false, 'error' => $lastError];
    }

    // ── Helpers ────────────────────────────────────────────────

    private function setting($key) {
        $stmt = $this->pdo->prepare("SELECT setting_value FROM platform_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        return $stmt->fetchColumn();
    }

    // Last AI error, readable by SuperAdmins (not in the public settings allowlist).
    private function recordError($message) {
        try {
            $value = $message === '' ? '' : date('Y-m-d H:i:s') . ' ' . mb_substr($message, 0, 500);
            $this->pdo->prepare("INSERT INTO platform_settings (setting_key, setting_value) VALUES ('ai_last_error', ?)
                                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)")
                      ->execute([$value]);
        } catch (Exception $e) { /* never break the chat over logging */ }
    }

    // Smart keyword-based fallback when no OpenAI key is configured
    private function smartFallback($message) {
        $msg = strtolower($message);

        if (preg_match('/price|cost|plan|subscription|billing|payment|charge/', $msg)) {
            return "Our pricing plans are available on the website. Feel free to reach out to our team for a custom quote, and a human agent will assist you shortly!";
        }
        if (preg_match('/hours|open|available|schedule|timing|when/', $msg)) {
            return "Our support team is available during business hours. If we are currently offline, please leave your message and we will get back to you as soon as possible!";
        }
        if (preg_match('/refund|cancel|money back|return/', $msg)) {
            return "For refund or cancellation requests, please contact our billing team directly. A human agent will review your case and assist you shortly.";
        }
        if (preg_match('/hello|hi|hey|howdy|good morning|good afternoon|good evening/', $msg)) {
            return "Hello! 👋 Welcome! I'm your AI support assistant. How can I help you today?";
        }
        if (preg_match('/thank|thanks|appreciate|great|awesome/', $msg)) {
            return "You're welcome! 😊 Is there anything else I can help you with?";
        }
        if (preg_match('/problem|issue|error|bug|not working|broken|fail/', $msg)) {
            return "I'm sorry to hear you're experiencing an issue! Please describe the problem in detail and a human support agent will investigate and assist you as soon as possible.";
        }
        if (preg_match('/help|support|assist|question/', $msg)) {
            return "I'm here to help! Please describe your question in detail and I'll do my best to assist. If needed, I'll connect you with a human agent.";
        }

        $fallbacks = [
            "Thanks for your message! Our AI assistant has noted your query. A human support agent will follow up shortly if more help is needed.",
            "I've received your message! Let me look into this for you. If I can't fully resolve it, a team member will assist you soon.",
            "Got it! I'm processing your request. Our support team is always available if you need further assistance.",
        ];
        return $fallbacks[array_rand($fallbacks)];
    }
}
?>
