<?php
/**
 * Get Auth Cookie Endpoint
 * 
 * Retrieves the stored Google OAuth access token from the secure cookie.
 * This endpoint is typically called from server-side code that needs to
 * use the access token for API requests.
 * 
 * @note: JavaScript cannot access HTTP-only cookies due to browser security.
 *        This endpoint must be called from server-side code or via
 *        a server-side proxy.
 */

header('Content-Type: application/json');

// Cookie name (must match the one used in set-auth-cookie.php)
$cookieName = 'google_auth_token';

// Check if cookie exists
if (!isset($_COOKIE[$cookieName]) || empty($_COOKIE[$cookieName])) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'No authentication token found in cookies',
        'message' => 'User is not logged in or token has expired'
    ]);
    exit();
}

$accessToken = $_COOKIE[$cookieName];

// Optionally validate the token format here
// For Google OAuth tokens, they typically start with specific patterns
if (!is_string($accessToken) || strlen($accessToken) < 10) {
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
