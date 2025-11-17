# Chrome Extension - Quick Reference

This directory contains the source files for the Chrome extension.

## Building

```bash
npm run build:extension
```

The built files will be in `chrome-extension/dist/`.

## Installation

1. Build the extension (see above)
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `chrome-extension/dist` folder

## Icons

Add icon files to this directory:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

The extension will work without icons, but Chrome will show a default placeholder.

For full documentation, see [../CHROME_EXTENSION.md](../CHROME_EXTENSION.md).

