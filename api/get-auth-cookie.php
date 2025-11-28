<?php
/**
 * Get Auth Cookie Endpoint
 *
 * Retrieves the stored Google OAuth access token from the secure cookie.
 * This endpoint is called from the frontend to check authentication status
 * and from the Google Sheets API proxy.
 *
 * @security:
 * - CORS: Restricted to known frontend origins
 * - Output Sanitization: Protects against XSS if token is ever mishandled
 */

// --- CORS Configuration ---
$allowedOrigins = ['http://localhost:5173', 'https://jajat.godieboy.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

// Cookie name (must match the one used in set-auth-cookie.php)
$cookieName = 'google_auth_token';

// Check if cookie exists and is valid
if (!isset($_COOKIE[$cookieName]) || !is_string($_COOKIE[$cookieName]) || empty($_COOKIE[$cookieName])) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'No authentication token found in cookies',
        'message' => 'User is not logged in or token has expired'
    ]);
    exit();
}

// Sanitize the token before output
$accessToken = htmlspecialchars($_COOKIE[$cookieName], ENT_QUOTES, 'UTF-8');

// Optionally, add a more robust validation for the token format
// Example: Check if it matches a typical Base64 pattern
if (!preg_match('/^[a-zA-Z0-9\-\_\.\~\+\/]+=*$/', $accessToken)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid token format'
    ]);
    exit();
}

// Return the access token
echo json_encode([
    'success' => true,
    'access_token' => $accessToken,
    'token_type' => 'Bearer'
]);
?>
