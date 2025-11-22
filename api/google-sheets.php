<?php
/**
 * Google Sheets API Proxy Endpoint
 *
 * This endpoint acts as a secure proxy between the frontend and Google Sheets API.
 * It retrieves the OAuth token from the secure HTTP-only cookie and makes
 * authenticated requests to Google Sheets API on behalf of the user.
 *
 * Supported operations:
 * - Create a new spreadsheet
 * - Sync job applications to a spreadsheet
 * - Get spreadsheet info
 *
 * @security:
 * - CORS: Restricted to known frontend origins
 * - Uses HTTP-only cookies (XSS protection)
 * - Validates authentication before any operation
 * - Sanitizes all inputs to prevent XSS and injection attacks
 */

// --- CORS Configuration ---
$allowedOrigins = ['http://localhost:5173', 'https://jajat.godieboy.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');

// --- Preflight Request Handling ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (in_array($origin, $allowedOrigins)) {
        http_response_code(200);
    } else {
        http_response_code(403); // Forbidden
    }
    exit();
}

// --- Helper function for sanitization ---
function sanitize_input($data) {
    if (is_array($data)) {
        return array_map('sanitize_input', $data);
    }
    if (is_string($data)) {
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    return $data;
}

// --- Authentication ---
$cookieName = 'google_auth_token';
if (!isset($_COOKIE[$cookieName]) || !is_string($_COOKIE[$cookieName]) || empty($_COOKIE[$cookieName])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required. Please log in with Google.'
    ]);
    exit();
}
$accessToken = htmlspecialchars($_COOKIE[$cookieName], ENT_QUOTES, 'UTF-8');


// --- Input Processing ---
$json = file_get_contents('php://input');
$data = json_decode($json, true) ?? [];
$sanitizedData = sanitize_input($data); // Sanitize all incoming data

$action = $sanitizedData['action'] ?? '';

// --- Routing ---
try {
    switch ($action) {
        case 'create_sheet':
            handleCreateSheet($accessToken, $sanitizedData);
            break;
        case 'sync_data':
            handleSyncData($accessToken, $sanitizedData);
            break;
        case 'get_sheet_info':
            handleGetSheetInfo($accessToken, $sanitizedData);
            break;
        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Invalid action. Supported actions: create_sheet, sync_data, get_sheet_info'
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Create a new Google Sheet.
 */
function handleCreateSheet($accessToken, $data) {
    $title = $data['title'] ?? 'Job Application Tracker';

    // Validate title
    if (empty($title) || !is_string($title) || strlen($title) > 100) {
        throw new Exception('Invalid or missing spreadsheet title.');
    }

    $spreadsheetData = [
        'properties' => ['title' => $title],
        'sheets' => [
            ['properties' => ['title' => 'Applications', 'gridProperties' => ['frozenRowCount' => 1]],
             'data' => [
                ['rowData' => [
                    ['values' => [
                        ['userEnteredValue' => ['stringValue' => 'ID']],
                        ['userEnteredValue' => ['stringValue' => 'Position']],
                        ['userEnteredValue' => ['stringValue' => 'Company']],
                        ['userEnteredValue' => ['stringValue' => 'Salary']],
                        ['userEnteredValue' => ['stringValue' => 'Status']],
                        ['userEnteredValue' => ['stringValue' => 'Application Date']],
                        ['userEnteredValue' => ['stringValue' => 'Interview Date']],
                        ['userEnteredValue' => ['stringValue' => 'Platform']],
                        ['userEnteredValue' => ['stringValue' => 'Contact Name']],
                        ['userEnteredValue' => ['stringValue' => 'Follow-up Date']],
                        ['userEnteredValue' => ['stringValue' => 'Link']],
                        ['userEnteredValue' => ['stringValue' => 'Notes']],
                        ['userEnteredValue' => ['stringValue' => 'Timeline Events']],
                    ]]
                ]]
            ]]
        ]
    ];

    $url = 'https://sheets.googleapis.com/v4/spreadsheets';
    $response = makeGoogleApiRequest($url, $accessToken, 'POST', $spreadsheetData);

    if ($response && isset($response['spreadsheetId'])) {
        $spreadsheetId = $response['spreadsheetId'];
        $sheetId = $response['sheets'][0]['properties']['sheetId'] ?? 0;
        formatHeaderRow($accessToken, $spreadsheetId, $sheetId);

        echo json_encode([
            'success' => true,
            'spreadsheetId' => $spreadsheetId,
            'spreadsheetUrl' => $response['spreadsheetUrl'] ?? "https://docs.google.com/spreadsheets/d/{$spreadsheetId}",
            'message' => 'Spreadsheet created successfully'
        ]);
    } else {
        throw new Exception('Failed to create spreadsheet: ' . json_encode($response));
    }
}

/**
 * Sync job applications data to Google Sheet.
 */
function handleSyncData($accessToken, $data) {
    $spreadsheetId = $data['spreadsheetId'] ?? null;
    $applications = $data['applications'] ?? [];

    if (!$spreadsheetId || !is_string($spreadsheetId) || !preg_match('/^[a-zA-Z0-9\-\_]+$/', $spreadsheetId)) {
        throw new Exception('Valid Spreadsheet ID is required.');
    }
    if (!is_array($applications)) {
        throw new Exception('Applications must be an array.');
    }

    $values = array_map(function($app) {
        $timelineStr = '';
        if (isset($app['timeline']) && is_array($app['timeline'])) {
            $events = array_map(function($event) {
                $type = $event['type'] ?? 'unknown';
                $date = $event['date'] ?? '';
                $status = $event['status'] ?? '';
                $customType = $event['customTypeName'] ?? '';
                $interviewer = $event['interviewerName'] ?? '';
                $notes = $event['notes'] ?? '';

                $eventStr = $customType ?: $type;
                if ($interviewer) $eventStr .= " with {$interviewer}";
                $eventStr .= " ({$status}) - {$date}";
                if ($notes) $eventStr .= ": {$notes}";
                return $eventStr;
            }, $app['timeline']);
            $timelineStr = implode('; ', $events);
        }
        return [
            $app['id'] ?? '', $app['position'] ?? '', $app['company'] ?? '',
            $app['salary'] ?? '', $app['status'] ?? '', $app['applicationDate'] ?? '',
            $app['interviewDate'] ?? '', $app['platform'] ?? '', $app['contactName'] ?? '',
            $app['followUpDate'] ?? '', $app['link'] ?? '', $app['notes'] ?? '', $timelineStr
        ];
    }, $applications);

    $range = 'Applications!A2:M1000';
    $clearUrl = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/" . urlencode($range) . ":clear";
    makeGoogleApiRequest($clearUrl, $accessToken, 'POST', []);

    if (!empty($values)) {
        $updateData = ['valueInputOption' => 'USER_ENTERED', 'data' => [['range' => 'Applications!A2', 'values' => $values]]];
        $updateUrl = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values:batchUpdate";
        $response = makeGoogleApiRequest($updateUrl, $accessToken, 'POST', $updateData);

        if ($response && isset($response['responses'])) {
            echo json_encode(['success' => true, 'rowsSynced' => count($values), 'message' => 'Data synced successfully']);
        } else {
            throw new Exception('Failed to sync data: ' . json_encode($response));
        }
    } else {
        echo json_encode(['success' => true, 'rowsSynced' => 0, 'message' => 'No data to sync']);
    }
}

/**
 * Get spreadsheet information.
 */
function handleGetSheetInfo($accessToken, $data) {
    $spreadsheetId = $data['spreadsheetId'] ?? null;

    if (!$spreadsheetId || !is_string($spreadsheetId) || !preg_match('/^[a-zA-Z0-9\-\_]+$/', $spreadsheetId)) {
        throw new Exception('Valid Spreadsheet ID is required.');
    }

    $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}";
    $response = makeGoogleApiRequest($url, $accessToken, 'GET');

    if ($response) {
        echo json_encode(['success' => true, 'spreadsheet' => $response]);
    } else {
        throw new Exception('Failed to get spreadsheet info');
    }
}

/**
 * Format header row.
 */
function formatHeaderRow($accessToken, $spreadsheetId, $sheetId = 0) {
    $formatData = [
        'requests' => [[
            'repeatCell' => [
                'range' => ['sheetId' => $sheetId, 'startRowIndex' => 0, 'endRowIndex' => 1],
                'cell' => ['userEnteredFormat' => [
                    'textFormat' => ['bold' => true],
                    'backgroundColor' => ['red' => 0.9, 'green' => 0.9, 'blue' => 0.9]
                ]],
                'fields' => 'userEnteredFormat(textFormat,backgroundColor)'
            ]
        ]]
    ];
    $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}:batchUpdate";
    makeGoogleApiRequest($url, $accessToken, 'POST', $formatData);
}

/**
 * Make an authenticated request to the Google API.
 */
function makeGoogleApiRequest($url, $accessToken, $method = 'GET', $data = null) {
    $ch = curl_init($url);
    $headers = ['Authorization: Bearer ' . $accessToken, 'Content-Type: application/json'];

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => $method,
    ]);

    if ($method === 'POST' && $data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        throw new Exception("cURL error: {$error}");
    }
    if ($httpCode >= 400) {
        $errorData = json_decode($response, true);
        $errorMessage = $errorData['error']['message'] ?? "HTTP {$httpCode} error";
        throw new Exception("Google API Error: {$errorMessage}");
    }

    return json_decode($response, true);
}
?>
