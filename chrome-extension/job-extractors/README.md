# Job Extractors

This directory contains the job data extraction system for the Chrome extension. The system is designed to be extensible, allowing easy addition of support for new job boards.

## Architecture

The extraction system uses an interface-based design:

- **`JobExtractor`**: Interface that all extractors must implement
- **`LinkedInJobExtractor`**: Example implementation for LinkedIn
- **`index.ts`**: Registry that manages all extractors and provides a unified API

## How to Add a New Extractor

### Step 1: Create the Extractor Class

Create a new file for your extractor, e.g., `GreenhouseJobExtractor.ts`:

```typescript
import { JobExtractor, JobData } from './JobExtractor';

export class GreenhouseJobExtractor implements JobExtractor {
  readonly name = 'Greenhouse';

  canHandle(url: string): boolean {
    return url.includes('boards.greenhouse.io') || url.includes('greenhouse.io');
  }

  extract(): JobData {
    const data: JobData = {};

    try {
      // Extract position/title
      const titleElement = document.querySelector('h1.job-title, .job-title h1');
      if (titleElement) {
        data.position = titleElement.textContent?.trim() || '';
      }

      // Extract company name
      const companyElement = document.querySelector('.company-name, .job-company');
      if (companyElement) {
        data.company = companyElement.textContent?.trim() || '';
      }

      // Extract location
      const locationElement = document.querySelector('.location, .job-location');
      if (locationElement) {
        data.location = locationElement.textContent?.trim() || '';
      }

      // Extract job description
      const descriptionElement = document.querySelector('.job-description, #job-description');
      if (descriptionElement) {
        const text = descriptionElement.textContent?.trim() || '';
        data.description = text.substring(0, 1000);
        if (text.length > 1000) {
          data.description += '...';
        }
      }

      // Extract salary (if available)
      const salaryElement = document.querySelector('.salary, .compensation');
      if (salaryElement) {
        data.salary = salaryElement.textContent?.trim() || '';
      }

      // Extract posted date (if available)
      const dateElement = document.querySelector('.posted-date, .job-posted-date');
      if (dateElement) {
        const dateText = dateElement.textContent || '';
        // Parse date format specific to Greenhouse
        // ... your date parsing logic here
      }

    } catch (error) {
      console.error(`Error extracting job data from ${this.name}:`, error);
    }

    return data;
  }
}
```

### Step 2: Register the Extractor

Add your extractor to the registry in `index.ts`:

```typescript
import { GreenhouseJobExtractor } from './GreenhouseJobExtractor';

const extractors: JobExtractor[] = [
  new LinkedInJobExtractor(),
  new GreenhouseJobExtractor(), // Add your new extractor here
  // ... more extractors
];
```

### Step 3: Update Manifest (if needed)

If the new job board requires specific URL patterns, update `manifest.json`:

```json
{
  "content_scripts": [
    {
      "matches": [
        "https://www.linkedin.com/jobs/view/*",
        "https://boards.greenhouse.io/*",  // Add new patterns
        "https://jobs.lever.co/*"
      ],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

### Step 4: Test Your Extractor

1. Build the extension: `npm run build:extension`
2. Load the extension in Chrome (chrome://extensions)
3. Navigate to a job posting on the new job board
4. Open the extension popup and verify that data is extracted correctly

## JobData Interface

All extractors must return a `JobData` object with the following optional fields:

```typescript
interface JobData {
  position?: string;      // Job title/position
  company?: string;        // Company name
  description?: string;    // Job description (max 1000 chars recommended)
  location?: string;        // Job location
  jobType?: string;        // Remote, Hybrid, On-site, etc.
  salary?: string;         // Salary/compensation information
  postedDate?: string;     // ISO format date (YYYY-MM-DD)
}
```

## Best Practices

1. **Error Handling**: Always wrap extraction logic in try-catch blocks
2. **Multiple Selectors**: Use multiple CSS selectors as fallbacks (job boards change their HTML frequently)
3. **Text Truncation**: Limit description to 1000 characters to avoid storage issues
4. **Date Parsing**: Handle various date formats (English, Spanish, etc.)
5. **Null Safety**: Always check if elements exist before accessing their properties
6. **Testing**: Test with multiple job postings from the same board to ensure consistency

## Example: Complete Greenhouse Extractor

See `LinkedInJobExtractor.ts` for a complete, production-ready example.

## Contributing

When adding a new extractor:

1. Follow the existing code style
2. Add comments for complex extraction logic
3. Test with multiple job postings
4. Update this README if needed
5. Consider adding unit tests (see `chrome-extension/__tests__/`)

