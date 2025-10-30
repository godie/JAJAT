<?php
/**
 * Clear Auth Cookie Endpoint
 * 
 * Removes the authentication cookie by setting it to expire immediately.
 * Called when user logs out.
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

$cookieName = 'google_auth_token';
$isProduction = $_SERVER['HTTPS'] === 'on' || isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https';
$secure = $isProduction;

// Set cookie to expire in the past to delete it
if (PHP_VERSION_ID >= 70300) {
    setcookie(
        $cookieName,
        '',
        [
            'expires' => time() - 3600,
            'path' => '/',
            'domain' => '',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Strict'
        ]
    );
} else {
    setcookie(
        $cookieName,
        '',
        time() - 3600,
        '/',
        '',
        $secure,
        true
    );
}

echo json_encode([
    'success' => true,
    'message' => 'Cookie cleared successfully'
]);
?>
