// chrome-extension/job-extractors/AshbyhqJobExtractor.ts
// AshbyHQ-specific job data extractor

import { JobExtractor, JobData } from './JobExtractor';

interface AshbyAppData {
  posting?: {
    title?: string;
    locationName?: string;
    workplaceType?: string;
    descriptionPlainText?: string;
    descriptionHtml?: string;
    compensationTierSummary?: string;
    publishedDate?: string;
  };
  organization?: {
    name?: string;
  };
}

interface WindowWithAppData extends Window {
  __appData?: AshbyAppData;
}

export class AshbyhqJobExtractor implements JobExtractor {
  readonly name = 'AshbyHQ';

  canHandle(url: string): boolean {
    return url.includes('jobs.ashbyhq.com') || url.includes('ashbyhq.com');
  }

  extractJobTitle(): string {
    // Try to extract from window.__appData (primary source for AshbyHQ)
    try {
      const appData = (window as WindowWithAppData).__appData;
      if (appData?.posting?.title) {
        return appData.posting.title;
      }
    } catch {
      // Fallback to other methods
    }

    // Try JSON-LD structured data
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd.title) {
          return jsonLd.title;
        }
      }
    } catch {
      // Continue to next method
    }

    // Try title tag
    const titleElement = document.querySelector('title');
    if (titleElement) {
      const titleText = titleElement.textContent?.trim() || '';
      // Format: "Job Title @ Company"
      const match = titleText.match(/^(.+?)\s+@/);
      if (match) {
        return match[1].trim();
      }
      return titleText;
    }

    // Try meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle?.content) {
      return ogTitle.content;
    }

    return '';
  }

  extractCompanyName(): string {
    // Try to extract from window.__appData
    try {
      const appData = (window as WindowWithAppData).__appData;
      if (appData?.organization?.name) {
        return appData.organization.name;
      }
    } catch {
      // Fallback to other methods
    }

    // Try JSON-LD structured data
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd.hiringOrganization?.name) {
          return jsonLd.hiringOrganization.name;
        }
      }
    } catch {
      // Continue to next method
    }

    // Try title tag (format: "Job Title @ Company")
    const titleElement = document.querySelector('title');
    if (titleElement) {
      const titleText = titleElement.textContent?.trim() || '';
      const match = titleText.match(/@\s*(.+?)$/);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  extractLocation(): string {
    // Try to extract from window.__appData
    try {
      const appData = (window as WindowWithAppData).__appData;
      if (appData?.posting?.locationName) {
        return appData.posting.locationName;
      }
    } catch {
      // Fallback to other methods
    }

    // Try JSON-LD structured data
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd.jobLocation?.address) {
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
      }
    } catch {
      // Continue to next method
    }

    return '';
  }

  extractJobType(): string {
    // Try to extract from window.__appData
    try {
      const appData = (window as WindowWithAppData).__appData;
      
      // Check workplaceType first (Hybrid, Remote, On-site)
      if (appData?.posting?.workplaceType) {
        const workplaceType = appData.posting.workplaceType;
        if (workplaceType === 'Remote' || workplaceType === 'Hybrid') {
          return workplaceType;
        }
        if (workplaceType === 'OnSite') {
          return 'On-site';
        }
      }

      // Check isRemote flag
      if (appData?.posting?.isRemote === true) {
        return 'Remote';
      }
    } catch {
      // Fallback to other methods
    }

    // Try JSON-LD structured data
    try {
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        const jsonLd = JSON.parse(jsonLdScript.textContent || '{}');
        if (jsonLd.jobLocationType === 'TELECOMMUTE') {
          return 'Remote';
        }
        if (jsonLd.workplaceType) {
          return jsonLd.workplaceType;
        }
      }
    } catch {
      // Continue to next method
    }

    return '';
  }

  extractJobDescription(): string {
    // Try to extract from window.__appData (prefer plain text)
    try {
      const appData = (window as WindowWithAppData).__appData;
      if (appData?.posting?.descriptionPlainText) {
        const text = appData.posting.descriptionPlainText.trim();
        if (text.length > 100) {
          const description = text.substring(0, 1000);
          return text.length > 1000 ? description + '...' : description;
        }
      }
      // Fallback to HTML description
      if (appData?.posting?.descriptionHtml) {
        // Create a temporary element to extract text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = appData.posting.descriptionHtml;
        const text = tempDiv.textContent?.trim() || '';
        if (text.length > 100) {
          const description = text.substring(0, 1000);
          return text.length > 1000 ? description + '...' : description;
        }
      }
    } catch {
      // Fallback to other methods
    }

    // Try JSON-LD structured data
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
      }
    } catch {
      // Continue to next method
    }

    // Try meta description
    const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDescription?.content) {
      const text = metaDescription.content.trim();
      if (text.length > 100) {
        const description = text.substring(0, 1000);
        return text.length > 1000 ? description + '...' : description;
      }
    }

    return '';
  }

  extractSalary(): string {
    // Try to extract from window.__appData
    try {
      const appData = (window as WindowWithAppData).__appData;
      if (appData?.posting?.compensationTierSummary) {
        return appData.posting.compensationTierSummary;
      }
      // Try compensationTiers array
      if (appData?.posting?.compensationTiers && appData.posting.compensationTiers.length > 0) {
        const tier = appData.posting.compensationTiers[0];
        if (tier.tierSummary) {
          return tier.tierSummary;
        }
      }
      // Try scrapeableCompensationSalarySummary
      if (appData?.posting?.scrapeableCompensationSalarySummary) {
        return appData.posting.scrapeableCompensationSalarySummary;
      }
    } catch {
      // Fallback to other methods
    }

    // Try JSON-LD structured data
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
      }
    } catch {
      // Continue to next method
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

      // Extract posted date from window.__appData or JSON-LD
      try {
        const appData = (window as WindowWithAppData).__appData;
        if (appData?.posting?.publishedDate) {
          // Parse date string (format: "YYYY-MM-DD")
          const date = new Date(appData.posting.publishedDate);
          if (!isNaN(date.getTime())) {
            data.postedDate = date.toISOString().split('T')[0];
          }
        } else {
          // If __appData doesn't have publishedDate, try JSON-LD fallback
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
            }
          } catch {
            // Date extraction failed
          }
        }
      } catch {
        // Try JSON-LD fallback if there was an exception
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
          }
        } catch {
          // Date extraction failed
        }
      }

    } catch (error) {
      console.error('Error extracting job data from AshbyHQ:', error);
    }

    return data;
  }
}