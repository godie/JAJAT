# Chrome Extension - Quick Reference

This directory contains the source files for the Chrome extension that captures job opportunities from multiple job boards.

## Supported Job Boards

The extension currently supports extracting job information from:

- **LinkedIn** - Full support for LinkedIn job postings
- **Greenhouse** - Complete extraction from Greenhouse job boards
- **AshbyHQ** - Full support for AshbyHQ job postings

## Architecture

The extension uses a modular extractor system:

```
chrome-extension/
├── job-extractors/
│   ├── JobExtractor.ts          # Base interface
│   ├── LinkedInJobExtractor.ts  # LinkedIn implementation
│   ├── GreenhouseJobExtractor.ts # Greenhouse implementation
│   ├── AshbyhqJobExtractor.ts   # AshbyHQ implementation
│   └── index.ts                 # Extractor registry
```

Each extractor implements the `JobExtractor` interface with methods for extracting:
- Job title
- Company name
- Location
- Job type (Remote, Hybrid, On-site)
- Job description
- Salary information
- Posted date

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

## Usage

1. Navigate to a job posting on a supported platform (LinkedIn, Greenhouse, or AshbyHQ)
2. Click the extension icon in your browser toolbar
3. Review and edit the extracted job information
4. Click "Save" to add it to your opportunities
5. The opportunity will automatically sync with the web app if it's open

## Supported URLs

- **LinkedIn**: `https://www.linkedin.com/jobs/view/*`
- **Greenhouse**: `https://boards.greenhouse.io/*`, `https://job-boards.greenhouse.io/*`
- **AshbyHQ**: `https://jobs.ashbyhq.com/*`, `https://*.ashbyhq.com/*`

## Icons

Add icon files to this directory:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

The extension will work without icons, but Chrome will show a default placeholder.

## Testing

Run tests for the extension:

```bash
npm test chrome-extension
```

All extractors have comprehensive unit tests covering:
- Individual extraction methods
- Full extraction workflows
- Edge cases and error handling
- Multiple data source fallbacks

## Adding New Extractors

To add support for a new job board:

1. Create a new file in `job-extractors/` (e.g., `LeverJobExtractor.ts`)
2. Implement the `JobExtractor` interface
3. Register it in `job-extractors/index.ts`
4. Add content script matches in `manifest.json`
5. Add comprehensive tests in `__tests__/`

For full documentation, see [../CHROME_EXTENSION.md](../CHROME_EXTENSION.md).

