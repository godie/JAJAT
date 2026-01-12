// chrome-extension/job-extractors/WorkableJobExtractor.ts
// Workable-specific job data extractor

import { JobExtractor, JobData } from './JobExtractor';

export class WorkableJobExtractor implements JobExtractor {
  readonly name = 'Workable';

  canHandle(url: string): boolean {
    return url.includes('apply.workable.com') || url.includes('workable.com/j/');
  }

  extractJobTitle(): string {
    // Try to extract from meta tags first (more reliable)
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle?.content) {
      // Format is usually: "Job Title - Location/Type - Company Name" or "Job Title - Company Name"
      const titleParts = ogTitle.content.split(' - ');
      if (titleParts.length > 0) {
        return titleParts[0].trim();
      }
    }

    // Fallback to page title
    const pageTitle = document.querySelector('title')?.textContent?.trim() || '';
    if (pageTitle) {
      const titleParts = pageTitle.split(' - ');
      return titleParts[0].trim();
    }

    // Try DOM selectors (after page loads)
    const titleSelectors = [
      'h1[class*="title"]',
      'h1[class*="heading"]',
      '.job-title h1',
      'h1.job-title',
      'h1',
    ];
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        if (text && text.length < 200) { // Reasonable title length
          return text;
        }
      }
    }

    return '';
  }

  extractCompanyName(): string {
    // Try to extract from meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle?.content) {
      // Format is usually: "Job Title - Location/Type - Company Name"
      const titleParts = ogTitle.content.split(' - ');
      if (titleParts.length > 1) {
        // Company name is usually the last part
        const companyName = titleParts[titleParts.length - 1].trim();
        if (companyName && companyName.length < 100) {
          return companyName;
        }
      }
    }

    // Try DOM selectors
    const companySelectors = [
      '[class*="company-name"]',
      '[class*="company"]',
      '.company',
      'a[class*="company"]',
    ];
    for (const selector of companySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        if (text && text.length < 100) {
          return text;
        }
      }
    }

    return '';
  }

  extractLocation(): string {
    // Try to extract from title (format: "Job Title - Location/Type - Company" or "Job Title - Type - Location - Company")
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle?.content) {
      const titleParts = ogTitle.content.split(' - ');
      if (titleParts.length >= 3) {
        // Look through middle parts (skip first and last) to find location
        for (let i = 1; i < titleParts.length - 1; i++) {
          const part = titleParts[i].trim();
          // Check if it looks like a location (not job type keywords, contains location-like text)
          const partLower = part.toLowerCase();
          if (part && 
              !partLower.includes('remote') &&
              !partLower.includes('hybrid') &&
              !partLower.includes('freelance') &&
              part.length < 100 &&
              (part.includes(',') || part.match(/[A-Z]{2,}/) || part.match(/\d/))) {
            // Likely a location if it has commas, uppercase words, or numbers
            return part;
          }
        }
      } else if (titleParts.length === 2) {
        // Only 2 parts: "Job Title - Company" - no location in title
        // This is fine, we'll try DOM selectors
      }
    }

    // Try DOM selectors
    const locationSelectors = [
      '[class*="location"]',
      '[class*="job-location"]',
      '.location',
      '[data-testid*="location"]',
    ];
    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        if (text) {
          // Remove job type keywords if present
          const locationText = text.split(',')[0].trim(); // Take first part if comma-separated
          return locationText;
        }
      }
    }

    return '';
  }

  extractJobType(): string {
    // Try to extract from title (format: "Job Title - Remote - Company" or "Job Title - Hybrid - Company")
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle?.content) {
      const titleLower = ogTitle.content.toLowerCase();
      if (titleLower.includes('remote') || titleLower.includes('remoto')) {
        return 'Remote';
      } else if (titleLower.includes('hybrid')) {
        return 'Hybrid';
      } else if (titleLower.includes('on-site') || titleLower.includes('onsite') || titleLower.includes('presencial')) {
        return 'On-site';
      } else if (titleLower.includes('freelance')) {
        return 'Freelance';
      }
    }

    // Try DOM selectors
    const locationSelectors = [
      '[class*="location"]',
      '[class*="job-location"]',
      '.location',
    ];
    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('remote') || text.includes('remoto')) {
          return 'Remote';
        } else if (text.includes('hybrid')) {
          return 'Hybrid';
        } else if (text.includes('on-site') || text.includes('onsite') || text.includes('presencial')) {
          return 'On-site';
        }
      }
    }

    return '';
  }

  extractJobDescription(): string {
    // Try meta description first (truncated but available immediately)
    const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (ogDescription?.content) {
      const description = ogDescription.content.trim();
      if (description.length > 100) {
        return description.substring(0, 1000) + (description.length > 1000 ? '...' : '');
      }
    }

    // Try DOM selectors for full description (after page loads)
    const descriptionSelectors = [
      '[class*="description"]',
      '[class*="job-description"]',
      '.description',
      '[data-testid*="description"]',
      'section[class*="description"]',
    ];
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        if (text.length > 100) {
          const description = text.substring(0, 1000);
          return text.length > 1000 ? description + '...' : description;
        }
      }
    }

    // Fallback to meta description even if short
    if (ogDescription?.content) {
      return ogDescription.content.trim();
    }

    return '';
  }

  extractSalary(): string {
    // Try DOM selectors for salary
    const salarySelectors = [
      '[class*="salary"]',
      '[class*="compensation"]',
      '[class*="pay"]',
      '[data-testid*="salary"]',
    ];
    for (const selector of salarySelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of Array.from(elements)) {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('$') || text.includes('€') || text.includes('£') || 
            text.includes('salary') || text.includes('compensation') ||
            text.includes('salario') || text.includes('remuneración')) {
          return element.textContent?.trim() || '';
        }
      }
    }

    // Also check in description
    const description = this.extractJobDescription();
    if (description) {
      const salaryMatch = description.match(/[$€£]\s*[\d,]+[,\d]*\s*[-–—]\s*[$€£]\s*[\d,]+[,\d]*/);
      if (salaryMatch) {
        return salaryMatch[0];
      }
    }

    return '';
  }

  extract(): JobData {
    const data: JobData = {};

    try {
      // Use individual extractor methods - only add to data if value is not empty
      const position = this.extractJobTitle();
      if (position) data.position = position;

      const company = this.extractCompanyName();
      if (company) data.company = company;

      const location = this.extractLocation();
      if (location) data.location = location;

      const jobType = this.extractJobType();
      if (jobType) data.jobType = jobType;

      const description = this.extractJobDescription();
      if (description) data.description = description;

      const salary = this.extractSalary();
      if (salary) data.salary = salary;

      // Extract posted date
      // Workable doesn't seem to have posted date in meta tags, so we'll try DOM selectors
      const dateSelectors = [
        '[class*="posted"]',
        '[class*="date"]',
        '[class*="published"]',
        '[data-testid*="date"]',
      ];
      for (const selector of dateSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent || '';
          // Look for various date formats:
          const postedMatch = text.match(/posted\s+(\d+)\s+days?\s+ago/i) ||
                             text.match(/(\d+)\s+days?\s+ago/i) ||
                             text.match(/hace\s+(\d+)\s+semanas?/i) ||
                             text.match(/hace\s+(\d+)\s+d[ií]as?/i) ||
                             text.match(/publicado\s+hace\s+(\d+)\s+d[ií]as?/i);
          
          if (postedMatch) {
            const daysAgo = parseInt(postedMatch[1], 10);
            const date = new Date();
            
            if (text.toLowerCase().includes('semanas') || text.toLowerCase().includes('weeks')) {
              date.setDate(date.getDate() - (daysAgo * 7));
            } else {
              date.setDate(date.getDate() - daysAgo);
            }
            
            data.postedDate = date.toISOString().split('T')[0];
            break;
          }

          // Try ISO date format
          const isoMatch = text.match(/\d{4}-\d{2}-\d{2}/);
          if (isoMatch) {
            data.postedDate = isoMatch[0];
            break;
          }
        }
      }

    } catch (error) {
      console.error('Error extracting job data from Workable:', error);
    }

    return data;
  }
}

