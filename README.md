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

# Getting Started: Local Setup
Follow these instructions to get a copy of the project up and running on your local machine.
## Prerequisites
- Node.js (v18 or higher recommended) and npm (Node Package Manager)
## Installation
1. Clone the repository:git clone [[https://github.com/godie/JAJAT.git](https://github.com/godie/JAJAT.git)]

2.  cd job-application-tracker

3. Install project dependencies:
npm install

4. Configure Environment Variables:
  - Create a file named .env.local in the project root and add your Google Identity Services (GIS) Client ID. This is required for the login functionality.# .env.local
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com"

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
  - Delete (Remove entry via hover button in the table
-Data Model: Includes comprehensive fields for tracking status, dates, contacts, and source platforms.

## User Interface & Interactivity
- Responsive Design: Styled entirely with Tailwind CSS utility classes for an optimized, mobile-first experience.
- Google Identity Services (GIS): Implements the modern GIS flow for real user authentication (login/logout simulation in the current frontend context).
- Keyboard Accessibility: Implements a custom hook (useKeyboardEscape) to allow users to close the modal form by pressing the Escape key, enhancing usability
- Metrics Summary: Provides a dashboard view of key application statistics (Applications, Interviews, Offers).

# File Structure
The project maintains a clean, scalable folder structure based on functional concerns:

```
job-application-tracker/
├── src/
│   ├── components/
│   │   ├── Header.tsx           // Application header, login button, and GIS logic.
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
│   │   ├── Header.test.tsx      // Tests for login/logout, GIS initialization, and button states.
│   │   └── HomePage.test.tsx    // Tests for CRUD, persistence loops, and table integrity.
│   ├── App.tsx
│   └── main.tsx
├── .env.local                   // Stores VITE_GOOGLE_CLIENT_ID (Ignored by Git).
└── tailwind.config.js
```
