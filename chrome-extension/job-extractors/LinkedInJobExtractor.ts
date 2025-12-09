// chrome-extension/job-extractors/LinkedInJobExtractor.ts
// LinkedIn-specific job data extractor

import { JobExtractor, JobData } from './JobExtractor';

export class LinkedInJobExtractor implements JobExtractor {
  readonly name = 'LinkedIn';

  canHandle(url: string): boolean {
    return url.includes('linkedin.com/jobs/view/') || url.includes('linkedin.com/jobs/collections/');
  }

  extractJobTitle(): string {
    // Extract position/title
    let title = '';
    const titleSelectors = [
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-details-top-card__job-title',
      'h1[data-test-id="job-title"]',
      'h1.job-details-jobs-unified-top-card__job-title',
    ];
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        title = element.textContent?.trim() || '';
        break;
      }
    }
    return title;
  }

  extractCompanyName(): string {
    const companySelectors = [
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-details-top-card__company-name',
      'a[data-test-id="job-company-name"]',
      '.jobs-details-top-card__company-info a',
    ];
    for (const selector of companySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent?.trim() || '';
      }
    }
    return '';
  }

  extractLocation(): string {
    const locationSelectors = [
      '.job-details-jobs-unified-top-card__primary-description-without-tagline',
      '.jobs-details-top-card__primary-description',
      '.jobs-details-top-card__primary-description-without-tagline',
      '.job-details-jobs-unified-top-card__primary-description',
    ];
    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        // Format is usually: "Location · Job Type" or "Location · Job Type · Posted X days ago"
        const parts = text.split('·').map(p => p.trim());
        if (parts.length > 0) {
          return parts[0];
        }
      }
    }
    return '';
  }

  extractJobType(): string {
    const locationSelectors = [
      '.job-details-jobs-unified-top-card__primary-description-without-tagline',
      '.jobs-details-top-card__primary-description',
      '.jobs-details-top-card__primary-description-without-tagline',
      '.job-details-jobs-unified-top-card__primary-description',
    ];
    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        const parts = text.split('·').map(p => p.trim());
        
        // Check each part for job type keywords
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].toLowerCase();
          if (part.includes('remote') || part.includes('remoto') || part.includes('en remoto')) {
            return parts[i];
          } else if (part.includes('hybrid')) {
            return parts[i];
          } else if (part.includes('on-site') || part.includes('onsite') || part.includes('presencial')) {
            return parts[i];
          }
        }
      }
    }
    return '';
  }

  extractJobDescription(): string {
    const descriptionSelectors = [
      '.jobs-description__text',
      '.jobs-description-content__text',
      '[data-test-id="job-description"]',
      '.jobs-box__html-content',
    ];
    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Get text content, limit to first 1000 characters
        const text = element.textContent?.trim() || '';
        if (text.length > 100) {
          const description = text.substring(0, 1000);
          return text.length > 1000 ? description + '...' : description;
        }
      }
    }
    return '';
  }

  extractSalary(): string {
    const salarySelectors = [
      '.job-details-jobs-unified-top-card__job-insight',
      '.jobs-details-top-card__job-insight',
      '[data-test-id="job-salary"]',
      '.job-details-jobs-unified-top-card__job-insight-text-item',
    ];
    for (const selector of salarySelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of Array.from(elements)) {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('$') || text.includes('salary') || text.includes('compensation') || 
            text.includes('€') || text.includes('£')) {
          return element.textContent?.trim() || '';
        }
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
      const dateSelectors = [
        '.job-details-jobs-unified-top-card__primary-description-without-tagline',
        '.jobs-details-top-card__primary-description',
        '.job-details-jobs-unified-top-card__primary-description',
      ];
      for (const selector of dateSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent || '';
          // Look for various date formats:
          // English: "Posted X days ago", "X days ago"
          // Spanish: "Hace X semanas", "Hace X días", "Publicado hace X días"
          const postedMatch = text.match(/posted\s+(\d+)\s+days?\s+ago/i) ||
                             text.match(/(\d+)\s+days?\s+ago/i) ||
                             text.match(/hace\s+(\d+)\s+semanas?/i) ||
                             text.match(/hace\s+(\d+)\s+d[ií]as?/i) ||
                             text.match(/publicado\s+hace\s+(\d+)\s+d[ií]as?/i);
          
          if (postedMatch) {
            const daysAgo = parseInt(postedMatch[1], 10);
            const date = new Date();
            
            // Handle "semanas" (weeks) vs "días" (days)
            if (text.toLowerCase().includes('semanas') || text.toLowerCase().includes('weeks')) {
              date.setDate(date.getDate() - (daysAgo * 7));
            } else {
              date.setDate(date.getDate() - daysAgo);
            }
            
            data.postedDate = date.toISOString().split('T')[0];
          }
          break;
        }
      }

    } catch (error) {
      console.error('Error extracting job data from LinkedIn:', error);
    }

    return data;
  }
}

