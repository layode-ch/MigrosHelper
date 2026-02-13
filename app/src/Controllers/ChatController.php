<?php

namespace MigrosHelper\Controllers;

use MigrosHelper\Enums\HTTPStatus;
use Psr\Http\Message\RequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class ChatController extends BaseController
{
    private const CHAT_API_URL = 'http://wrapper:3000/api/chat';
    private const SEARCH_GROUP_API_URL = 'http://wrapper:3000/api/search-group';

    public function chat(Request $req, Response $resp): Response
    {
        $body = $this->getBody($req);

        $message = $body['message'] ?? '';
        $filters = $body['filters'] ?? [];
        $conversationHistory = $body['conversationHistory'] ?? [];

        if (empty($message)) {
            return $this->sendErrors(
                ['error' => 'message is required'],
                HTTPStatus::BAD_REQUEST
            );
        }

        $payload = json_encode([
            'message' => $message,
            'filters' => $filters,
            'conversationHistory' => $conversationHistory,
        ]);

        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => $payload,
                'timeout' => 30,
                'ignore_errors' => true,
            ],
        ]);

        $result = @file_get_contents(self::CHAT_API_URL, false, $context);

        if ($result === false) {
            $httpStatus = $this->extractHttpStatus($http_response_header ?? []);
            error_log("[ChatController::chat] Connection to wrapper failed. HTTP status: {$httpStatus}");
            return $this->sendErrors(
                ['error' => 'Failed to contact AI service'],
                HTTPStatus::BAD_GATEWAY
            );
        }

        $httpStatus = $this->extractHttpStatus($http_response_header ?? []);
        if ($httpStatus >= 400) {
            error_log("[ChatController::chat] Wrapper returned HTTP {$httpStatus}. Body: " . substr($result, 0, 500));
        }

        $decoded = json_decode($result, true);

        if ($decoded === null) {
            error_log("[ChatController::chat] json_decode failed. Raw response: " . substr($result, 0, 500));
            return $this->sendErrors(
                ['error' => 'Invalid response from AI service'],
                HTTPStatus::BAD_GATEWAY
            );
        }

        return $this->sendJSON($decoded);
    }

    public function searchGroup(Request $req, Response $resp): Response
    {
        $body = $this->getBody($req);

        $term = $body['term'] ?? '';
        $priceSort = $body['priceSort'] ?? null;

        if (empty($term)) {
            return $this->sendErrors(
                ['error' => 'term is required'],
                HTTPStatus::BAD_REQUEST
            );
        }

        $payload = json_encode([
            'term' => $term,
            'priceSort' => $priceSort,
        ]);

        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => $payload,
                'timeout' => 15,
                'ignore_errors' => true,
            ],
        ]);

        $result = @file_get_contents(self::SEARCH_GROUP_API_URL, false, $context);

        if ($result === false) {
            $httpStatus = $this->extractHttpStatus($http_response_header ?? []);
            error_log("[ChatController::searchGroup] Connection to wrapper failed. HTTP status: {$httpStatus}");
            return $this->sendErrors(
                ['error' => 'Failed to contact search service'],
                HTTPStatus::BAD_GATEWAY
            );
        }

        $httpStatus = $this->extractHttpStatus($http_response_header ?? []);
        if ($httpStatus >= 400) {
            error_log("[ChatController::searchGroup] Wrapper returned HTTP {$httpStatus}. Body: " . substr($result, 0, 500));
        }

        $decoded = json_decode($result, true);

        if ($decoded === null) {
            error_log("[ChatController::searchGroup] json_decode failed. Raw response: " . substr($result, 0, 500));
            return $this->sendErrors(
                ['error' => 'Invalid response from search service'],
                HTTPStatus::BAD_GATEWAY
            );
        }

        return $this->sendJSON($decoded);
    }

    private function extractHttpStatus(array $headers): int
    {
        foreach ($headers as $header) {
            if (preg_match('/^HTTP\/[\d.]+ (\d{3})/', $header, $m)) {
                return (int) $m[1];
            }
        }
        return 0;
    }
}
