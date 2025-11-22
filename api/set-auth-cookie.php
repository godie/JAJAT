<?php
/**
 * Set Auth Cookie Endpoint
 *
 * Stores Google OAuth access token in a secure, HTTP-only cookie.
 * This endpoint receives POST requests from the React frontend
 * and sets an HTTP-only cookie that cannot be accessed by JavaScript.
 *
 * @security:
 * - HttpOnly: Prevents JavaScript access (XSS protection)
 * - Secure: Only sent over HTTPS
 * - SameSite=Strict: CSRF protection
 * - CORS: Restricted to known frontend origins
 * - Input Sanitization: Protects against injection attacks
 */

// --- CORS Configuration ---
// Define allowed origins
$allowedOrigins = ['http://localhost:5173', 'https://jajat.godieboy.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (in_array($origin, $allowedOrigins)) {
        http_response_code(200);
    } else {
        http_response_code(403); // Forbidden
    }
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Use POST.'
    ]);
    exit();
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate and sanitize input
if (!isset($data['access_token']) || !is_string($data['access_token']) || empty(trim($data['access_token']))) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing, empty, or invalid access_token in request body'
    ]);
    exit();
}

// Sanitize the token to prevent any potential injection issues
$accessToken = htmlspecialchars($data['access_token'], ENT_QUOTES, 'UTF-8');

// Cookie configuration
$cookieName = 'google_auth_token';
$expiryTime = time() + (7 * 24 * 60 * 60); // 7 days
$path = '/';
$domain = ''; // Current domain

// Set secure cookie flags based on environment
$isProduction = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ||
                (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

$secure = $isProduction;
$httpOnly = true;
$sameSite = 'Strict';

// For PHP 7.3+, use array syntax for SameSite attribute
if (PHP_VERSION_ID >= 70300) {
    setcookie(
        $cookieName,
        $accessToken,
        [
            'expires' => $expiryTime,
            'path' => $path,
            'domain' => $domain,
            'secure' => $secure,
            'httponly' => $httpOnly,
            'samesite' => $sameSite
        ]
    );
} else {
    // Fallback for older PHP versions (manually append SameSite)
    $cookieHeader = "{$cookieName}=" . urlencode($accessToken);
    $cookieHeader .= "; expires=" . gmdate('D, d M Y H:i:s T', $expiryTime);
    $cookieHeader .= "; path={$path}";
    if ($domain) $cookieHeader .= "; domain={$domain}";
    if ($secure) $cookieHeader .= "; secure";
    if ($httpOnly) $cookieHeader .= "; httponly";
    $cookieHeader .= "; samesite={$sameSite}";
    header("Set-Cookie: {$cookieHeader}", false);
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Cookie set successfully',
    'expires_in' => 7 * 24 * 60 * 60 // 7 days in seconds
]);
?>
