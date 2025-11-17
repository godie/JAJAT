// chrome-extension/__tests__/setup.ts
// Setup file for Chrome extension tests
import { chrome } from '../__mocks__/chrome';

// Make chrome available globally
//(global as any).chrome = chrome;
Object.defineProperty(global, 'chrome', { value: chrome });

// Load content script to register message listeners
// This will execute the chrome.runtime.onMessage.addListener calls
if (typeof window !== 'undefined') {
  // Import content script to register listeners
  // Note: This will execute the top-level code in content.ts
  import('../content').catch(() => {
    // Ignore import errors in test environment
  });
  
  // Import background script to register listeners
  import('../background').catch(() => {
    // Ignore import errors in test environment
  });
}

