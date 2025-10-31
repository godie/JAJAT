# Job Application Tracker
# Project Overview
This is a modern Job Application Tracker built using React, TypeScript, and Tailwind CSS. The project follows Test-Driven Development (TDD) principles, utilizing Vitest and React Testing Library for comprehensive unit and component testing.The application manages job applications locally, with an architecture designed for seamless integration with external services like Google Sheets.

# Technology Stack
The project is built on the following modern technologies:

| Category | Technology | Purpose |
|----------|-----------|----------|
| Frontend | React (Hooks & Functional Components) | User Interface |
| Language | TypeScript | Strong Typing and Scalability |
| Styling | Tailwind CSS | Utility-First CSS Framework and Responsive Design |
| Tooling | Vite | Modern Frontend Build Tool |
| Testing | Vitest & React Testing Library | Test Runner and Component Testing (TDD) |
| Authentication | @react-oauth/google | Google OAuth Integration |

# Getting Started: Local Setup
Follow these instructions to get a copy of the project up and running on your local machine.
## Prerequisites
- Node.js (v22 recommended) and npm (Node Package Manager)
- PHP 7.4+ (for backend cookie handling)
## Installation
1. Clone the repository:
```shell
git clone https://github.com/godie/JAJAT.git job-application-tracker
```
2. Enter folder
```shell
cd job-application-tracker
```

3. Install project dependencies:
```shell 
npm install
```

4. Configure Environment Variables:
Create a file named `.env.local` in the project root and add your Google OAuth Client ID. This is required for the login functionality.

### .env.local
```bash
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com"

# API Base URL (optional - defaults to /api)
# For production, set this to your full API URL
VITE_API_BASE_URL="/api"
```

> **Note:** The `.env.local` file is gitignored and will not be committed to version control.
# Available Scripts
In the project directory, you can run:
- npm run dev
    - Runs the app in development mode using Vite. Open http://localhost:5173 to view it in the browser. The page will reload upon edits.
- npm test
    - Runs all unit and component tests via Vitest in one pass.
- npm run test:watchStarts the Vitest test runner in watch mode (recommended for TDD).
- npm run buildBuilds the application for production to the dist folder.

# Key Features

## Development & Architecture

- Test-Driven Development (TDD): Rigorous testing implemented for all core components and functional flows (CRUD, persistence, and login state).
- Clean Architecture: Utilizes the Adapter pattern to prepare for pluggable external data sources (e.g., Google Sheets, Airtable) without modifying core application logic.
- Vite Environment Variables: Secure management of the Google Client ID using VITE_ prefixed environment variables.

## Data Management & Persistence
- Local Storage Persistence: All job application data is persisted locally in the browser's localStorage for simple, quick data retention.
- Full CRUD Functionality: Supports:
  - Create (Add New Entry)
  - Read (Display in the table)
  - Update (Edit entry via table row click)
  - Delete (Remove entry via hover button in the table)
-Data Model: Includes comprehensive fields for tracking status, dates, contacts, and source platforms.

## User Interface & Interactivity
- Responsive Design: Styled entirely with Tailwind CSS utility classes for an optimized, mobile-first experience.
- Google OAuth Authentication: Implements secure Google authentication using `@react-oauth/google` library with backend cookie support for token storage.
- Keyboard Accessibility: Implements a custom hook (useKeyboardEscape) to allow users to close the modal form by pressing the Escape key, enhancing usability
- Metrics Summary: Provides a dashboard view of key application statistics (Applications, Interviews, Offers).

## Security & Authentication
- Secure Cookie Storage: Google OAuth tokens are stored in secure, HTTP-only cookies managed by PHP backend.
- OAuth 2.0 Flow: Full OAuth 2.0 implementation with access token management.
- Backend Integration: PHP endpoints for secure cookie handling (set and read).

# Backend API Endpoints
The project includes PHP endpoints for secure cookie management. These endpoints must be deployed to a PHP server with HTTPS enabled.

## Authentication Endpoints

### Set Auth Cookie
- **Endpoint:** `POST /api/set-auth-cookie.php`
- **Purpose:** Store Google OAuth access token in a secure, HTTP-only cookie
- **Request Body:** JSON with `access_token` field
- **Response:** JSON with success status
- **Security:** Cookie is set with `HttpOnly`, `Secure`, and `SameSite=Strict` flags

### Get Auth Cookie
- **Endpoint:** `GET /api/get-auth-cookie.php`
- **Purpose:** Retrieve the stored OAuth access token from the secure cookie
- **Response:** JSON with `access_token` field or error message
- **Security:** Only accessible server-side; JavaScript cannot read HTTP-only cookies

### Clear Auth Cookie (Logout)
- **Endpoint:** `POST /api/clear-auth-cookie.php`
- **Purpose:** Remove the authentication cookie when user logs out
- **Response:** JSON with success status
- **Security:** Cookie is deleted by setting expiry to past time

> **Note:** Due to browser security restrictions, JavaScript cannot read HTTP-only cookies. The backend PHP endpoints handle all cookie operations securely.

# File Structure
The project maintains a clean, scalable folder structure based on functional concerns:

```
job-application-tracker/
├── src/
│   ├── components/
│   │   ├── Header.tsx           // Application header, login button, and OAuth logic.
│   │   ├── ApplicationTable.tsx // Table displaying job entries and handling edit/delete UI.
│   │   ├── AddJobForm.tsx       // Modal form for creating and editing job entries.
│   │   └── SheetSyncManager.tsx // [Future] Component for handling external sync (e.g., Sheets).
│   ├── pages/
│   │   └── HomePage.tsx         // Main container; manages global application state (applications, modal visibility).
│   ├── utils/
│   │   └── localStorage.ts      // Utility functions for data persistence and login status logic.
│   ├── hooks/
│   │   ├── useKeyboardKey.ts    // Generic hook for listening to any key press.
│   │   └── useKeyboardEscape.ts // Semantic wrapper for closing modals on 'Escape' key.
│   ├── adapters/
│   │   ├── IAdapter.ts          // Target interface for external data services (Adapter Pattern).
│   │   └── GoogleSheetAdapter.ts// [Future] Adapter implementation for Google Sheets API.
│   ├── tests/
│   │   ├── Header.test.tsx      // Tests for login/logout, OAuth initialization, and button states.
│   │   └── HomePage.test.tsx    // Tests for CRUD, persistence loops, and table integrity.
│   ├── App.tsx                  // Main app component with GoogleOAuthProvider wrapper.
│   └── main.tsx
├── api/                         // PHP backend endpoints
│   ├── set-auth-cookie.php      // Secure cookie setting for OAuth tokens
│   ├── get-auth-cookie.php      // Secure cookie retrieval for OAuth tokens
│   └── clear-auth-cookie.php    // Secure cookie deletion for logout
├── .env.local                   // Stores VITE_GOOGLE_CLIENT_ID (Ignored by Git).
├── .nvmrc                       // Node version specification (v22)
└── tailwind.config.js
```

## Deployment & Backend Setup

### PHP Backend Configuration

1. Deploy PHP files to your web server:
   - Ensure the `/api` directory is accessible via HTTPS
   - PHP version 7.4+ required
   - PHP must have cookie and JSON support enabled

2. Configure CORS (if needed):
   - Update `Access-Control-Allow-Origin` headers in PHP files if frontend and backend are on different domains
   - Adjust CORS settings in the PHP files as needed for your deployment

3. Test the endpoints:
   ```bash
   # Test set cookie
   curl -X POST https://jajat.godieboy.com/api/set-auth-cookie.php \
     -H "Content-Type: application/json" \
     -d '{"access_token": "test_token"}'
   
   # Test get cookie
   curl -X GET https://jajat.godieboy.com/api/get-auth-cookie.php \
     --cookie "google_auth_token=test_token"
   ```

### Frontend Integration

The React app automatically calls these endpoints when:
- User logs in: Token is stored in secure cookie via `setAuthCookie()`
- User logs out: Cookie is cleared via `clearAuthCookie()`
- App needs token: Backend can retrieve it using `getAuthCookie()`

> **Important:** The cookie is HTTP-only and secure, so JavaScript cannot read it directly. This protects against XSS attacks.

## Contributing

This project follows Test-Driven Development (TDD) principles. All new features should include comprehensive tests.

## License

[Add your license information here]
