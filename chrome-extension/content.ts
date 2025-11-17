// chrome-extension/content.ts
// Content script to extract job data from LinkedIn job pages

interface JobData {
  position?: string;
  company?: string;
  description?: string;
  location?: string;
  jobType?: string;
  salary?: string;
  postedDate?: string;
}

// Listen for messages from popup
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getJobData') {
      const jobData = extractJobData();
      sendResponse({ data: jobData });
    } else if (request.action === 'syncOpportunity') {
      // Sync opportunity to web app localStorage
      syncToWebApp(request.data);
      sendResponse({ success: true });
    }
    return true; // Keep message channel open for async response
  });
}

export function extractJobData(): JobData {
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
          if (part.includes('remote') || part.includes('hybrid') || part.includes('on-site') || part.includes('onsite')) {
            data.jobType = parts[1];
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
    ];
    for (const selector of salarySelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of Array.from(elements)) {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('$') || text.includes('salary') || text.includes('compensation')) {
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
    ];
    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || '';
        // Look for "Posted X days ago" or similar
        const postedMatch = text.match(/posted\s+(\d+)\s+days?\s+ago/i);
        if (postedMatch) {
          const daysAgo = parseInt(postedMatch[1], 10);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          data.postedDate = date.toISOString().split('T')[0];
        }
        break;
      }
    }

  } catch (error) {
    console.error('Error extracting job data:', error);
  }

  return data;
}

interface OpportunityData {
  id: string;
  position: string;
  company: string;
  link: string;
  description?: string;
  location?: string;
  jobType?: string;
  salary?: string;
  postedDate?: string;
  capturedDate: string;
}

export function syncToWebApp(opportunity: OpportunityData) {
  try {
    // Try to sync with web app via localStorage
    // This will work if the web app is open in another tab
    window.postMessage({
      type: 'JOB_OPPORTUNITY_SYNC',
      data: opportunity,
    }, '*');

    // Also try to write directly to localStorage (if same origin)
    // Note: This won't work cross-origin, but the postMessage should work
    const existing = localStorage.getItem('jobOpportunities');
    const opportunities = existing ? JSON.parse(existing) : [];
    opportunities.push(opportunity);
    localStorage.setItem('jobOpportunities', JSON.stringify(opportunities));
  } catch (error) {
    console.error('Error syncing to web app:', error);
  }
}

// Also listen for page changes (LinkedIn uses SPA navigation)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      // Page changed, data might have changed
      // The popup will request fresh data when opened
    }
  }).observe(document, { subtree: true, childList: true });
}

