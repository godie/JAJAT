// src/types/google.d.ts

// This ensures the general types for google.accounts are available
/// <reference types="@types/google.accounts" />

// Define the structure of the Google object available on the window
// This is necessary because the script loaded in index.html defines it globally.
declare global {
  interface Window {
    // 💡 Declares the object that holds the core GIS functionality
    google: {
      accounts: google.accounts.Accounts;
      // You can add other Google services here if needed (e.g., gapi)
    };
    
    // 💡 Declares the global callback function used in the GIS setup
    handleCredentialResponse: (response: google.accounts.id.CredentialResponse) => void;
  }
}

export {}; // Ensure this is treated as a module