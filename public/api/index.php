<?php
/**
 * PHP Centra API proxy — handles /api/partner/hotels/* routes.
 * Drop-in replacement for Vercel serverless functions.
 *
 * Place at: public/api/index.php  (copied to dist/api/index.php by Vite build)
 * .htaccess routes /api/* requests here.
 */

header('Content-Type: application/json; charset=utf-8');

// ── Config ─────────────────────────────────────────────────────────
$API_BASE_URL      = getenv('API_BASE_URL')      ?: 'https://api.centra.global/api';
$CLIENT_ID         = getenv('PARTNER_APP_CLIENT_ID');
$CLIENT_SECRET     = getenv('PARTNER_APP_CLIENT_SECRET');

if (!$CLIENT_ID || !$CLIENT_SECRET) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Missing PARTNER_APP_CLIENT_ID or PARTNER_APP_CLIENT_SECRET']);
    exit;
}

// ── Helpers ─────────────────────────────────────────────────────────

function buildPartnerUrl($base, $endpoint) {
    $base = rtrim($base, '/');
    if (str_ends_with($base, '/api') && str_starts_with($endpoint, '/api/')) {
        return $base . substr($endpoint, 4);
    }
    return $base . $endpoint;
}

function centraFetch($url, $token, $orgId = null) {
    $headers = ["Authorization: Bearer $token", 'Content-Type: application/json'];
    if ($orgId) {
        $headers[] = "x-organization-id: $orgId";
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    $raw   = curl_exec($ch);
    $info  = curl_getinfo($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        throw new RuntimeException("cURL error: $error");
    }

    $status = $info['http_code'] ?? 0;
    $ct     = $info['content_type'] ?? '';

    if ($status === 0) {
        throw new RuntimeException("HTTP request failed (no response)");
    }

    return ['status' => $status, 'body' => $raw, 'content_type' => $ct];
}

function centraLogin($baseUrl, $clientId, $clientSecret) {
    $url = "$baseUrl/apps/login";
    $body = json_encode(['clientId' => $clientId, 'clientSecret' => $clientSecret]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $body,
        CURLOPT_TIMEOUT        => 15,
    ]);
    $raw   = curl_exec($ch);
    $info  = curl_getinfo($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        throw new RuntimeException("Login cURL error: $error");
    }

    $status = $info['http_code'] ?? 0;
    if ($status !== 200) {
        throw new RuntimeException("Login failed — POST $url returned $status\nBody: " . mb_substr($raw, 0, 500));
    }

    $data = json_decode($raw, true);
    if (!$data) {
        throw new RuntimeException("Login failed — could not parse JSON response from $url");
    }

    $payload = $data['data'] ?? $data;
    if (empty($payload['accessToken'])) {
        throw new RuntimeException("Login succeeded but no accessToken in response");
    }

    return $payload['accessToken'];
}

function extractCentraHotelId($imageUrls) {
    if (!is_array($imageUrls)) return null;
    foreach ($imageUrls as $url) {
        if (preg_match('#/(HT-[A-Z0-9]+)/#i', (string)$url, $m)) return $m[1];
    }
    return null;
}

function extractCentraOrganizationId($imageUrls) {
    if (!is_array($imageUrls)) return null;
    foreach ($imageUrls as $url) {
        if (preg_match('#/(ORG-[A-Z0-9]+)/#i', (string)$url, $m)) return $m[1];
    }
    return null;
}

function centraApiCall($baseUrl, $token, $endpoint, $orgId = null) {
    $url = buildPartnerUrl($baseUrl, $endpoint);
    $result = centraFetch($url, $token, $orgId);

    if ($result['status'] === 401) {
        // Token expired — caller should re-login and retry
        throw new RuntimeException("Token expired (401)", 401);
    }

    if ($result['status'] < 200 || $result['status'] >= 300) {
        throw new RuntimeException(
            "Partner API fetch failed — GET $url returned {$result['status']}.\n" .
            "  Content-Type: {$result['content_type']}\n" .
            "  Body: " . mb_substr($result['body'], 0, 500)
        );
    }

    if (!str_contains($result['content_type'], 'application/json')) {
        throw new RuntimeException(
            "Partner API fetch — GET $url returned non-JSON.\n" .
            "  Content-Type: {$result['content_type']}\n" .
            "  Body: " . mb_substr($result['body'], 0, 300)
        );
    }

    $parsed = json_decode($result['body'], true);
    if (!$parsed) {
        throw new RuntimeException("Partner API fetch — could not parse JSON from $url");
    }

    if (empty($parsed['success'])) {
        throw new RuntimeException(
            "Partner API fetch — API returned success=false.\n" .
            "  Message: " . ($parsed['message'] ?? 'none') . "\n" .
            "  Code: " . ($parsed['code'] ?? 'none') . "\n" .
            "  Body: " . mb_substr($result['body'], 0, 500)
        );
    }

    return $parsed['data'];
}

// ── Normalize hotel field names ──
function normalizeHotel($h) {
    if (!is_array($h)) return $h;
    $h['phone_number']       = $h['phone_number'] ?? $h['phoneNumber'] ?? null;
    $h['simple_booking_link'] = $h['simple_booking_link'] ?? $h['simpleBookingLink'] ?? null;
    return $h;
}

// ── Parse request URI ───────────────────────────────────────────────
$uri    = $_SERVER['REQUEST_URI'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Strip query string for path matching
$path = parse_url($uri, PHP_URL_PATH);
// Remove trailing slash
$path = rtrim($path, '/');

try {
    // ── Route: GET /api/partner/hotels/{id}/content ──
    if (preg_match('#^/api/partner/hotels/([^/]+)/content$#', $path, $m)) {
        $hotelId = $m[1];
        $headerOrg = $_SERVER['HTTP_X_PARTNER_ORGANIZATION_ID'] ?? null;

        $token = centraLogin($API_BASE_URL, $CLIENT_ID, $CLIENT_SECRET);
        $data = null;
        $fallbackAttempted = false;

        try {
            $data = centraApiCall($API_BASE_URL, $token, "/api/partner/hotels/$hotelId/content", $headerOrg ?: null);
        } catch (RuntimeException $err) {
            $fallbackAttempted = true;
            // Fallback: fetch listing, find hotel, return its data
            $hotels = centraApiCall($API_BASE_URL, $token, '/partner/hotels/content?limit=all');
            $matched = null;
            if (is_array($hotels)) {
                foreach ($hotels as $h) {
                    if (extractCentraHotelId($h['image_urls'] ?? []) === $hotelId) {
                        $matched = $h;
                        break;
                    }
                }
            }
            if (!$matched) {
                throw new RuntimeException("Hotel $hotelId not found in listing fallback");
            }
            $data = normalizeHotel($matched);
        }

        echo json_encode(['success' => true, 'data' => $data, 'debug' => [
            'hotelId'           => $hotelId,
            'fallbackAttempted' => $fallbackAttempted,
        ]]);
        exit;
    }

    // ── Route: GET /api/partner/hotels (listing) ──
    if ($path === '/api/partner/hotels') {
        $token = centraLogin($API_BASE_URL, $CLIENT_ID, $CLIENT_SECRET);
        $hotels = centraApiCall($API_BASE_URL, $token, '/partner/hotels/content?limit=all');

        // Apply server-side filters
        $cityId         = $_GET['city_id'] ?? null;
        $propertyTypeId = $_GET['property_type_id'] ?? null;
        $amenityIds     = $_GET['amenity_ids'] ?? null;
        $search         = $_GET['search'] ?? null;

        $hasFilters = $cityId || $propertyTypeId || $amenityIds || ($search && trim($search));

        if ($hasFilters && is_array($hotels)) {
            if ($cityId) {
                $ids = array_filter(array_map('trim', explode(',', $cityId)));
                $hotels = array_values(array_filter($hotels, fn($h) => in_array($h['city_id'] ?? '', $ids, true)));
            }
            if ($propertyTypeId) {
                $ids = array_filter(array_map('trim', explode(',', $propertyTypeId)));
                $hotels = array_values(array_filter($hotels, fn($h) => in_array($h['property_type_id'] ?? '', $ids, true)));
            }
            if ($amenityIds) {
                $required = array_filter(array_map('trim', explode(',', $amenityIds)));
                $hotels = array_values(array_filter($hotels, function($h) use ($required) {
                    $hotelAm = $h['amenity_ids'] ?? [];
                    foreach ($required as $r) {
                        if (!in_array($r, $hotelAm, true)) return false;
                    }
                    return true;
                }));
            }
            if ($search && trim($search)) {
                $q = mb_strtolower(trim($search));
                $hotels = array_values(array_filter($hotels, function($h) use ($q) {
                    $name = mb_strtolower($h['name']['fr'] ?? $h['name']['en'] ?? $h['name'] ?? '');
                    $city = mb_strtolower((string)($h['city_id'] ?? ''));
                    return str_contains($name, $q) || str_contains($city, $q);
                }));
            }
        }

        $count = is_array($hotels) ? count($hotels) : 0;
        echo json_encode([
            'success' => true,
            'data'    => $hotels,
            'meta'    => ['total' => $count, 'filtered' => $hasFilters],
        ]);
        exit;
    }

    // ── Route: GET /api/partner/hotels/:id (legacy) ──
    if (preg_match('#^/api/partner/hotels/([^/]+)$#', $path, $m)) {
        $hotelId = $m[1];
        $token = centraLogin($API_BASE_URL, $CLIENT_ID, $CLIENT_SECRET);
        $data = centraApiCall($API_BASE_URL, $token, "/api/partner/hotels/$hotelId/content");
        echo json_encode(['success' => true, 'data' => $data]);
        exit;
    }

    // ── No matching API route ──
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => "API route not found: $path"]);

} catch (RuntimeException $e) {
    $code = $e->getCode() ?: 500;
    http_response_code($code >= 100 && $code < 600 ? $code : 500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
