<?php
/**
 * Clear Auth Cookie Endpoint
 *
 * Removes the authentication cookie by setting it to expire immediately.
 * Called when user logs out.
 *
 * @security:
 * - CORS: Restricted to known frontend origins
 * - HttpOnly, Secure, SameSite=Strict flags are respected
 */

// --- CORS Configuration ---
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

$cookieName = 'google_auth_token';
$isProduction = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ||
                (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$secure = $isProduction;
$path = '/';
$domain = '';

// Set cookie to expire in the past to delete it
if (PHP_VERSION_ID >= 70300) {
    setcookie(
        $cookieName,
        '',
        [
            'expires' => time() - 3600,
            'path' => $path,
            'domain' => $domain,
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Strict'
        ]
    );
} else {
    // Fallback for older PHP versions
    $cookieHeader = "{$cookieName}="; // Empty value
    $cookieHeader .= "; expires=" . gmdate('D, d M Y H:i:s T', time() - 3600);
    $cookieHeader .= "; path={$path}";
    if ($domain) $cookieHeader .= "; domain={$domain}";
    if ($secure) $cookieHeader .= "; secure";
    $cookieHeader .= "; httponly";
    $cookieHeader .= "; samesite=Strict";
    header("Set-Cookie: {$cookieHeader}", false);
}

// Also clear the cookie from the $_COOKIE superglobal for the current request
unset($_COOKIE[$cookieName]);

echo json_encode([
    'success' => true,
    'message' => 'Cookie cleared successfully'
]);
?>
