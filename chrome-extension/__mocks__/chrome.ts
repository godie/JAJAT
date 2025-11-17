// Mock Chrome Extension APIs for testing
/* eslint-disable @typescript-eslint/no-explicit-any */

export const chrome = {
  runtime: {
    onMessage: {
      addListener: vi.fn((callback: (request: unknown, sender: unknown, sendResponse: (response: unknown) => void) => boolean | void) => {
        // Store listener for testing
        (global as any).chromeMessageListener = callback;
      }),
    },
    onInstalled: {
      addListener: vi.fn((callback: (details: { reason: string }) => void) => {
        // Store listener for testing
        (global as any).chromeInstalledListener = callback;
      }),
    },
    lastError: undefined as { message?: string } | undefined,
  },
  tabs: {
    query: vi.fn((queryInfo: { active?: boolean; currentWindow?: boolean }, callback: (tabs: Array<{ id?: number; url?: string }>) => void) => {
      // Default mock: return empty array
      callback([]);
    }),
    sendMessage: vi.fn((tabId: number, message: unknown, callback?: (response: unknown) => void) => {
      if (callback) {
        callback({ success: true });
      }
      return Promise.resolve({ success: true });
    }),
    create: vi.fn(() => {
      // Mock implementation
    }),
  },
  storage: {
    local: {
      get: vi.fn((keys: string[] | null, callback: (items: { [key: string]: unknown }) => void) => {
        callback({});
      }),
      set: vi.fn((items: { [key: string]: unknown }, callback?: () => void) => {
        if (callback) {
          callback();
        }
        return Promise.resolve();
      }),
    },
  },
};

// Make chrome available globally
(global as any).chrome = chrome;

