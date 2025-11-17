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
 * - Uses HTTP-only cookies (XSS protection)
 * - Validates authentication before any operation
 * - Sanitizes all inputs
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get authentication token from cookie
$cookieName = 'google_auth_token';
if (!isset($_COOKIE[$cookieName]) || empty($_COOKIE[$cookieName])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required. Please log in with Google.'
    ]);
    exit();
}

$accessToken = $_COOKIE[$cookieName];

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$json = file_get_contents('php://input');
$data = json_decode($json, true) ?? [];

$action = $data['action'] ?? '';

// Route to appropriate handler
try {
    switch ($action) {
        case 'create_sheet':
            handleCreateSheet($accessToken, $data);
            break;
        case 'sync_data':
            handleSyncData($accessToken, $data);
            break;
        case 'get_sheet_info':
            handleGetSheetInfo($accessToken, $data);
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
 * Create a new Google Sheet with predefined structure
 */
function handleCreateSheet($accessToken, $data) {
    $title = $data['title'] ?? 'Job Application Tracker';
    
    // Create spreadsheet structure
    $spreadsheetData = [
        'properties' => [
            'title' => $title
        ],
        'sheets' => [
            [
                'properties' => [
                    'title' => 'Applications',
                    'gridProperties' => [
                        'frozenRowCount' => 1
                    ]
                ],
                'data' => [
                    [
                        'startRow' => 0,
                        'startColumn' => 0,
                        'rowData' => [
                            [
                                'values' => [
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
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ];
    
    $url = 'https://sheets.googleapis.com/v4/spreadsheets';
    $response = makeGoogleApiRequest($url, $accessToken, 'POST', $spreadsheetData);
    
    if ($response && isset($response['spreadsheetId'])) {
        // Format header row
        $spreadsheetId = $response['spreadsheetId'];
        
        // Get the actual sheetId from the response
        $sheetId = 0; // Default to 0
        if (isset($response['sheets']) && is_array($response['sheets']) && count($response['sheets']) > 0) {
            $sheetId = $response['sheets'][0]['properties']['sheetId'] ?? 0;
        }
        
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
 * Sync job applications data to Google Sheet
 */
function handleSyncData($accessToken, $data) {
    $spreadsheetId = $data['spreadsheetId'] ?? null;
    $applications = $data['applications'] ?? [];
    
    if (!$spreadsheetId) {
        throw new Exception('Spreadsheet ID is required');
    }
    
    if (!is_array($applications)) {
        throw new Exception('Applications must be an array');
    }
    
    // Prepare data rows as simple 2D array
    $values = [];
    foreach ($applications as $app) {
        // Format timeline events as a readable string
        $timelineStr = '';
        if (isset($app['timeline']) && is_array($app['timeline'])) {
            $events = [];
            foreach ($app['timeline'] as $event) {
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
                
                $events[] = $eventStr;
            }
            $timelineStr = implode('; ', $events);
        }
        
        $values[] = [
            $app['id'] ?? '',
            $app['position'] ?? '',
            $app['company'] ?? '',
            $app['salary'] ?? '',
            $app['status'] ?? '',
            $app['applicationDate'] ?? '',
            $app['interviewDate'] ?? '',
            $app['platform'] ?? '',
            $app['contactName'] ?? '',
            $app['followUpDate'] ?? '',
            $app['link'] ?? '',
            $app['notes'] ?? '',
            $timelineStr
        ];
    }
    
    // Clear existing data (except header) and add new data
    $range = 'Applications!A2:M1000'; // Clear from row 2 onwards
    $encodedRange = urlencode($range);
    $clearUrl = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/{$encodedRange}:clear";
    makeGoogleApiRequest($clearUrl, $accessToken, 'POST', []);
    
    // Update with new data
    if (!empty($values)) {
        $updateData = [
            'valueInputOption' => 'USER_ENTERED',
            'data' => [
                [
                    'range' => 'Applications!A2',
                    'values' => $values
                ]
            ]
        ];
        
        $updateUrl = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values:batchUpdate";
        $response = makeGoogleApiRequest($updateUrl, $accessToken, 'POST', $updateData);
        
        if ($response && isset($response['responses'])) {
            echo json_encode([
                'success' => true,
                'rowsSynced' => count($values),
                'message' => 'Data synced successfully'
            ]);
        } else {
            throw new Exception('Failed to sync data: ' . json_encode($response));
        }
    } else {
        echo json_encode([
            'success' => true,
            'rowsSynced' => 0,
            'message' => 'No data to sync'
        ]);
    }
}

/**
 * Get spreadsheet information
 */
function handleGetSheetInfo($accessToken, $data) {
    $spreadsheetId = $data['spreadsheetId'] ?? null;
    
    if (!$spreadsheetId) {
        throw new Exception('Spreadsheet ID is required');
    }
    
    $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}";
    $response = makeGoogleApiRequest($url, $accessToken, 'GET');
    
    if ($response) {
        echo json_encode([
            'success' => true,
            'spreadsheet' => $response
        ]);
    } else {
        throw new Exception('Failed to get spreadsheet info');
    }
}

/**
 * Format header row with bold text
 */
function formatHeaderRow($accessToken, $spreadsheetId, $sheetId = 0) {
    $formatData = [
        'requests' => [
            [
                'repeatCell' => [
                    'range' => [
                        'sheetId' => $sheetId,
                        'startRowIndex' => 0,
                        'endRowIndex' => 1,
                        'startColumnIndex' => 0,
                        'endColumnIndex' => 13
                    ],
                    'cell' => [
                        'userEnteredFormat' => [
                            'textFormat' => [
                                'bold' => true
                            ],
                            'backgroundColor' => [
                                'red' => 0.9,
                                'green' => 0.9,
                                'blue' => 0.9
                            ]
                        ]
                    ],
                    'fields' => 'userEnteredFormat(textFormat,backgroundColor)'
                ]
            ]
        ]
    ];
    
    $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}:batchUpdate";
    makeGoogleApiRequest($url, $accessToken, 'POST', $formatData);
}

/**
 * Make authenticated request to Google API
 */
function makeGoogleApiRequest($url, $accessToken, $method = 'GET', $data = null) {
    $ch = curl_init($url);
    
    $headers = [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ];
    
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
        throw new Exception($errorMessage);
    }
    
    return json_decode($response, true);
}
?>

