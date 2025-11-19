// chrome-extension/job-extractors/LinkedInJobExtractor.ts
// LinkedIn-specific job data extractor

import { JobExtractor, JobData } from './JobExtractor';

export class LinkedInJobExtractor implements JobExtractor {
  readonly name = 'LinkedIn';

  canHandle(url: string): boolean {
    return url.includes('linkedin.com/jobs/view/') || url.includes('linkedin.com/jobs/collections/');
  }

  extract(): JobData {
    const data: JobData = {};

    try {
      // Extract position/title
      const titleSelectors = [
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-details-top-card__job-title',
        'h1[data-test-id="job-title"]',
        'h1.job-details-jobs-unified-top-card__job-title',
      ];
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.position = element.textContent?.trim() || '';
          break;
        }
      }

      // Extract company name
      const companySelectors = [
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-details-top-card__company-name',
        'a[data-test-id="job-company-name"]',
        '.jobs-details-top-card__company-info a',
      ];
      for (const selector of companySelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.company = element.textContent?.trim() || '';
          break;
        }
      }

      // Extract location and job type
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
          // Try to parse location and job type from text
          // Format is usually: "Location · Job Type" or "Location · Job Type · Posted X days ago"
          const parts = text.split('·').map(p => p.trim());
          if (parts.length > 0) {
            data.location = parts[0];
          }
          if (parts.length > 1) {
            // Check if it's a job type (Remote, Hybrid, On-site) or posted date
            const part = parts[1].toLowerCase();
            if (part.includes('remote') || part.includes('hybrid') || part.includes('on-site') || 
                part.includes('onsite') || part.includes('remoto') || part.includes('en remoto') ||
                part.includes('presencial') || part.includes('on-site')) {
              data.jobType = parts[1];
            }
          }
          
          // Also check for job type in other parts
          for (let i = 1; i < parts.length; i++) {
            const part = parts[i].toLowerCase();
            if (part.includes('remote') || part.includes('remoto') || part.includes('hybrid') || 
                part.includes('on-site') || part.includes('presencial')) {
              data.jobType = parts[i];
              break;
            }
          }
          break;
        }
      }

      // Extract job description
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
          data.description = text.substring(0, 1000);
          if (text.length > 1000) {
            data.description += '...';
          }
          break;
        }
      }

      // Extract salary (if available)
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
            data.salary = element.textContent?.trim() || '';
            break;
          }
        }
        if (data.salary) break;
      }

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

