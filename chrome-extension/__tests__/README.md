# Chrome Extension Tests

This directory contains unit tests for the Chrome extension components.

## Running Tests

```bash
# Run all extension tests
npm test -- chrome-extension

# Run tests in watch mode
npm run test:watch -- chrome-extension

# Run with coverage
npm run test:cov -- chrome-extension
```

## Test Structure

- `content.test.ts` - Tests for the content script that extracts job data from LinkedIn
- `background.test.ts` - Tests for the background service worker
- `__mocks__/chrome.ts` - Mock implementation of Chrome Extension APIs

## Mocking Chrome APIs

The tests use a custom mock for Chrome Extension APIs located in `__mocks__/chrome.ts`. This mock provides:

- `chrome.runtime.onMessage` - Message listener
- `chrome.runtime.onInstalled` - Installation listener
- `chrome.tabs.query` - Tab querying
- `chrome.tabs.sendMessage` - Sending messages to tabs
- `chrome.storage.local` - Local storage operations

## Testing Strategy

1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test message handlers and communication between components
3. **Mock DOM**: Use jsdom to simulate browser DOM for content script tests

## Notes

- The content script functions (`extractJobData`, `syncToWebApp`) are exported for testing
- Chrome APIs are conditionally registered to avoid errors in test environment
- DOM mocks are set up in `beforeEach` to ensure clean state between tests

