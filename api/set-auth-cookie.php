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
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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

// Validate input
if (!isset($data['access_token']) || empty($data['access_token'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing or empty access_token in request body'
    ]);
    exit();
}

$accessToken = $data['access_token'];

// Cookie configuration
$cookieName = 'google_auth_token';
$expiryTime = time() + (7 * 24 * 60 * 60); // 7 days
$path = '/';
$domain = ''; // Leave empty for current domain

// Set secure cookie flags based on environment
$isProduction = $_SERVER['HTTPS'] === 'on' || isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https';
$secure = $isProduction; // Only secure in production
$httpOnly = true; // Always HTTP-only for security
$sameSite = 'Strict'; // CSRF protection

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
    // Fallback for older PHP versions (without SameSite support)
    setcookie(
        $cookieName,
        $accessToken,
        $expiryTime,
        $path,
        $domain,
        $secure,
        $httpOnly
    );
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Cookie set successfully',
    'expires_in' => 7 * 24 * 60 * 60 // 7 days in seconds
]);
?>
