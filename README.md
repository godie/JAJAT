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

- Test-Driven Development (TDD): Comprehensive testing with 36+ tests covering all core components, views, and functionality
- Clean Architecture: Utilizes the Adapter pattern to prepare for pluggable external data sources (e.g., Google Sheets, Airtable)
- Modular Component Design: Reusable, tested components with clear separation of concerns
- Type Safety: Full TypeScript implementation with strict type checking
- Vite Environment Variables: Secure management of the Google Client ID using VITE_ prefixed environment variables

## Data Management & Persistence
- Local Storage Persistence: All job application data is persisted locally in the browser's localStorage for simple, quick data retention.
- Full CRUD Functionality: Supports:
  - Create (Add New Entry)
  - Read (Display in the table)
  - Update (Edit entry via table row click)
  - Delete (Remove entry via hover button in the table)
- Advanced Data Model: Hybrid approach supporting:
  - **Timeline-based tracking**: Full interview process with multiple stages (Screener, Technical, System Design, Hiring Manager, etc.)
  - **Legacy compatibility**: Automatic migration from simple status fields
  - **Custom fields**: User-defined fields for flexible data tracking
  - **Event status**: Complete interview tracking with scheduled, completed, cancelled, and pending states

## User Interface & Interactivity
- **Multiple View Modes**: Switch between different visualizations:
  - **Table View**: Enhanced table with all job application data
  - **Timeline View**: Chronological visualization of interview process with status indicators
  - **Kanban View**: Board-style organization (Coming Soon)
  - **Calendar View**: Date-based interview planning (Coming Soon)
- **Custom Alert System**: Beautiful, accessible alerts with auto-dismiss (success, error, warning, info) replacing browser alerts
- **Timeline Editor**: Full-featured editor for managing interview events with stages, statuses, and notes
- Responsive Design: Styled entirely with Tailwind CSS utility classes for an optimized, mobile-first experience
- Google OAuth Authentication: Implements secure Google authentication using `@react-oauth/google` library with backend cookie support for token storage
- Keyboard Accessibility: Implements a custom hook (useKeyboardEscape) to allow users to close the modal form by pressing the Escape key
- Metrics Summary: Provides a dashboard view of key application statistics (Applications, Interviews, Offers)

## Interview Timeline System

The application features a sophisticated timeline system for tracking the complete interview lifecycle:

- **14 Interview Stage Types**: From initial application to final offer/rejection
- **Event Management**: Add, edit, and delete timeline events with dates, status, notes, and interviewer names
- **Auto-Generation**: Timeline automatically created from application and interview dates
- **Visual Indicators**: Color-coded status badges (completed, scheduled, cancelled, pending)
- **Chronological Sorting**: Events automatically sorted by date
- **Next Event Highlighting**: Quick view of upcoming interviews
- **Timeline View**: Beautiful vertical timeline visualization with visual connections
- **Interviewer Tracking**: Optional interviewer name field for each event

Supported interview stages include: Application Submitted, Screener Call, First Contact, Technical Interview, Code Challenge, Live Coding, Hiring Manager, System Design, Cultural Fit, Final Round, Offer, Rejected, Withdrawn, and Custom.

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
│   │   ├── TimelineView.tsx     // Timeline visualization of interview process.
│   │   ├── TimelineEditor.tsx   // Editor for managing interview timeline events.
│   │   ├── ViewSwitcher.tsx     // Component for switching between view modes.
│   │   ├── Alert.tsx            // Beautiful alert notification component.
│   │   ├── AlertProvider.tsx    // Context provider for alert management.
│   │   └── SheetSyncManager.tsx // [Future] Component for handling external sync (e.g., Sheets).
│   ├── pages/
│   │   └── HomePage.tsx         // Main container; manages global state and view switching.
│   ├── utils/
│   │   ├── localStorage.ts      // Data persistence, migration, and interview event utilities.
│   │   └── api.ts               // API utilities for PHP backend communication.
│   ├── hooks/
│   │   ├── useKeyboardKey.ts    // Generic hook for listening to any key press.
│   │   └── useKeyboardEscape.ts // Semantic wrapper for closing modals on 'Escape' key.
│   ├── adapters/
│   │   ├── IAdapter.ts          // Target interface for external data services (Adapter Pattern).
│   │   └── GoogleSheetAdapter.ts// [Future] Adapter implementation for Google Sheets API.
│   ├── tests/
│   │   ├── Header.test.tsx      // Tests for login/logout, OAuth, and button states.
│   │   ├── HomePage.test.tsx    // Tests for CRUD, persistence, and table integrity.
│   │   ├── Alert.test.tsx       // Tests for alert component rendering and behavior.
│   │   ├── AlertProvider.test.tsx // Tests for alert context and management.
│   │   └── TimelineEditor.test.tsx // Tests for timeline event editing.
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

## Testing

The project includes comprehensive test coverage:

```
Test Files: 5 passed (5)
Tests: 35 passed (35)
```

All tests can be run with `npm test` or `npm run test:watch` for TDD workflow.

## Contributing

This project follows Test-Driven Development (TDD) principles. All new features should include comprehensive tests.

## License

[Add your license information here]
