// chrome-extension/job-extractors/LeverJobExtractor.ts
// Lever.co-specific job data extractor

import { JobExtractor, JobData } from './JobExtractor';

export class LeverJobExtractor implements JobExtractor {
  readonly name = 'Lever';

  canHandle(url: string): boolean {
    return url.includes('jobs.lever.co') || 
           url.includes('.lever.co/') ||
           url.includes('lever.co/');
  }

  extractJobTitle(): string {
    // Try JSON-LD structured data first (most reliable for Lever)
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd['@type'] === 'JobPosting' && jsonLd.title) {
          return jsonLd.title;
        }
        // Handle array format
        if (Array.isArray(jsonLd)) {
          const jobPosting = jsonLd.find((item: unknown) => 
            typeof item === 'object' && 
            item !== null && 
            (item as { '@type'?: string })['@type'] === 'JobPosting'
          );
          if (jobPosting && typeof jobPosting === 'object' && jobPosting !== null) {
            const title = (jobPosting as { title?: string }).title;
            if (title) return title;
          }
        }
      }
    } catch {
      // Continue to other methods
    }

    // Try meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle?.content) {
      // Format is usually: "Job Title - Company" or just "Job Title"
      const titleParts = ogTitle.content.split(' - ');
      return titleParts[0].trim();
    }

    // Try page title
    const pageTitle = document.querySelector('title')?.textContent?.trim() || '';
    if (pageTitle) {
      const titleParts = pageTitle.split(' - ');
      return titleParts[0].trim();
    }

    // Try DOM selectors (Lever-specific classes)
    const titleSelectors = [
      'h1[class*="posting-title"]',
      'h1[class*="job-title"]',
      '.posting-header h1',
      '.posting-header-title h1',
      'h1',
    ];
    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        if (text && text.length < 200) {
          return text;
        }
      }
    }

    return '';
  }

  extractCompanyName(): string {
    // Try JSON-LD structured data first
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd.hiringOrganization?.name) {
          return jsonLd.hiringOrganization.name;
        }
        // Handle array format
        if (Array.isArray(jsonLd)) {
          const jobPosting = jsonLd.find((item: unknown) => 
            typeof item === 'object' && 
            item !== null && 
            (item as { '@type'?: string })['@type'] === 'JobPosting'
          );
          if (jobPosting && typeof jobPosting === 'object' && jobPosting !== null) {
            const org = (jobPosting as { hiringOrganization?: { name?: string } }).hiringOrganization;
            if (org?.name) return org.name;
          }
        }
      }
    } catch {
      // Continue to other methods
    }

    // Try meta tags
    const ogSiteName = document.querySelector('meta[property="og:site_name"]') as HTMLMetaElement;
    if (ogSiteName?.content) {
      return ogSiteName.content;
    }

    // Try extracting from og:title (format: "Job Title - Company")
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle?.content) {
      const titleParts = ogTitle.content.split(' - ');
      if (titleParts.length > 1) {
        const companyName = titleParts[titleParts.length - 1].trim();
        if (companyName && companyName.length < 100) {
          return companyName;
        }
      }
    }

    // Try DOM selectors
    const companySelectors = [
      '[class*="posting-header"] [class*="company"]',
      '[class*="company-name"]',
      '.posting-header a[class*="company"]',
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
    // Try JSON-LD structured data first
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd.jobLocation) {
          // Handle single location
          if (jsonLd.jobLocation.address) {
            const address = jsonLd.jobLocation.address;
            const parts = [
              address.addressLocality,
              address.addressRegion,
              address.addressCountry
            ].filter(Boolean);
            if (parts.length > 0) {
              return parts.join(', ');
            }
          }
          // Handle string location
          if (typeof jsonLd.jobLocation === 'string') {
            return jsonLd.jobLocation;
          }
        }
        // Handle array format
        if (Array.isArray(jsonLd)) {
          const jobPosting = jsonLd.find((item: unknown) => 
            typeof item === 'object' && 
            item !== null && 
            (item as { '@type'?: string })['@type'] === 'JobPosting'
          );
          if (jobPosting && typeof jobPosting === 'object' && jobPosting !== null) {
            const location = (jobPosting as { jobLocation?: unknown }).jobLocation;
            if (typeof location === 'string') {
              return location;
            }
            if (location && typeof location === 'object' && 'address' in location) {
              const address = (location as { address?: { addressLocality?: string; addressRegion?: string; addressCountry?: string } }).address;
              if (address) {
                const parts = [
                  address.addressLocality,
                  address.addressRegion,
                  address.addressCountry
                ].filter(Boolean);
                if (parts.length > 0) {
                  return parts.join(', ');
                }
              }
            }
          }
        }
      }
    } catch {
      // Continue to other methods
    }

    // Try DOM selectors
    const locationSelectors = [
      '[class*="posting-categories"] [class*="location"]',
      '[class*="posting-header"] [class*="location"]',
      '[class*="job-location"]',
      '[class*="location"]',
      '.posting-header .posting-category',
    ];
    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        if (text) {
          // Remove job type keywords if present
          const locationText = text.split(',')[0].trim();
          return locationText;
        }
      }
    }

    return '';
  }

  extractJobType(): string {
    // Try JSON-LD structured data first
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd.jobLocationType === 'TELECOMMUTE') {
          return 'Remote';
        }
        // Handle array format
        if (Array.isArray(jsonLd)) {
          const jobPosting = jsonLd.find((item: unknown) => 
            typeof item === 'object' && 
            item !== null && 
            (item as { '@type'?: string })['@type'] === 'JobPosting'
          );
          if (jobPosting && typeof jobPosting === 'object' && jobPosting !== null) {
            const locationType = (jobPosting as { jobLocationType?: string }).jobLocationType;
            if (locationType === 'TELECOMMUTE') {
              return 'Remote';
            }
          }
        }
      }
    } catch {
      // Continue to other methods
    }

    // Try DOM selectors (check location/category text)
    const locationSelectors = [
      '[class*="posting-categories"]',
      '[class*="posting-header"] [class*="location"]',
      '[class*="job-location"]',
      '[class*="location"]',
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

    // Check in meta title
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle?.content) {
      const titleLower = ogTitle.content.toLowerCase();
      if (titleLower.includes('remote') || titleLower.includes('remoto')) {
        return 'Remote';
      } else if (titleLower.includes('hybrid')) {
        return 'Hybrid';
      } else if (titleLower.includes('on-site') || titleLower.includes('onsite')) {
        return 'On-site';
      }
    }

    return '';
  }

  extractJobDescription(): string {
    // Try JSON-LD structured data first
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd.description) {
          // Remove HTML tags from description
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = jsonLd.description;
          const text = tempDiv.textContent?.trim() || '';
          if (text.length > 100) {
            const description = text.substring(0, 1000);
            return text.length > 1000 ? description + '...' : description;
          }
        }
        // Handle array format
        if (Array.isArray(jsonLd)) {
          const jobPosting = jsonLd.find((item: unknown) => 
            typeof item === 'object' && 
            item !== null && 
            (item as { '@type'?: string })['@type'] === 'JobPosting'
          );
          if (jobPosting && typeof jobPosting === 'object' && jobPosting !== null) {
            const description = (jobPosting as { description?: string }).description;
            if (description) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = description;
              const text = tempDiv.textContent?.trim() || '';
              if (text.length > 100) {
                const descriptionText = text.substring(0, 1000);
                return text.length > 1000 ? descriptionText + '...' : descriptionText;
              }
            }
          }
        }
      }
    } catch {
      // Continue to other methods
    }

    // Try meta description
    const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (ogDescription?.content) {
      const description = ogDescription.content.trim();
      if (description.length > 100) {
        return description.substring(0, 1000) + (description.length > 1000 ? '...' : '');
      }
    }

    // Try DOM selectors (Lever-specific classes)
    const descriptionSelectors = [
      '[class*="posting-description"]',
      '[class*="section"] [class*="description"]',
      '[class*="job-description"]',
      '.posting-content',
      'section[class*="content"]',
      '[class*="description"]',
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
    // Try JSON-LD structured data first
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd.baseSalary) {
          const salary = jsonLd.baseSalary;
          const currency = salary.currency || '';
          const minValue = salary.value?.minValue;
          const maxValue = salary.value?.maxValue;
          const unitText = salary.value?.unitText || '';
          
          if (minValue && maxValue) {
            return `${currency}${minValue.toLocaleString()} – ${currency}${maxValue.toLocaleString()} ${unitText}`.trim();
          } else if (minValue) {
            return `${currency}${minValue.toLocaleString()} ${unitText}`.trim();
          }
        }
        // Handle array format
        if (Array.isArray(jsonLd)) {
          const jobPosting = jsonLd.find((item: unknown) => 
            typeof item === 'object' && 
            item !== null && 
            (item as { '@type'?: string })['@type'] === 'JobPosting'
          );
          if (jobPosting && typeof jobPosting === 'object' && jobPosting !== null) {
            const baseSalary = (jobPosting as { baseSalary?: { currency?: string; value?: { minValue?: number; maxValue?: number; unitText?: string } } }).baseSalary;
            if (baseSalary) {
              const currency = baseSalary.currency || '';
              const minValue = baseSalary.value?.minValue;
              const maxValue = baseSalary.value?.maxValue;
              const unitText = baseSalary.value?.unitText || '';
              
              if (minValue && maxValue) {
                return `${currency}${minValue.toLocaleString()} – ${currency}${maxValue.toLocaleString()} ${unitText}`.trim();
              } else if (minValue) {
                return `${currency}${minValue.toLocaleString()} ${unitText}`.trim();
              }
            }
          }
        }
      }
    } catch {
      // Continue to other methods
    }

    // Try DOM selectors
    const salarySelectors = [
      '[class*="salary"]',
      '[class*="compensation"]',
      '[class*="pay"]',
      '[class*="posting-categories"] [class*="salary"]',
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

      // Extract posted date from JSON-LD
      try {
        const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
        if (jsonLdScript) {
          const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
          if (jsonLd.datePosted) {
            const date = new Date(jsonLd.datePosted);
            if (!isNaN(date.getTime())) {
              data.postedDate = date.toISOString().split('T')[0];
            }
          }
          // Handle array format
          if (Array.isArray(jsonLd) && !data.postedDate) {
            const jobPosting = jsonLd.find((item: unknown) => 
              typeof item === 'object' && 
              item !== null && 
              (item as { '@type'?: string })['@type'] === 'JobPosting'
            );
            if (jobPosting && typeof jobPosting === 'object' && jobPosting !== null) {
              const datePosted = (jobPosting as { datePosted?: string }).datePosted;
              if (datePosted) {
                const date = new Date(datePosted);
                if (!isNaN(date.getTime())) {
                  data.postedDate = date.toISOString().split('T')[0];
                }
              }
            }
          }
        }
      } catch {
        // Try DOM selectors for date
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
            const postedMatch = text.match(/posted\s+(\d+)\s+days?\s+ago/i) ||
                               text.match(/(\d+)\s+days?\s+ago/i) ||
                               text.match(/hace\s+(\d+)\s+semanas?/i) ||
                               text.match(/hace\s+(\d+)\s+d[ií]as?/i);
            
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
      }

    } catch (error) {
      console.error('Error extracting job data from Lever:', error);
    }

    return data;
  }
}
