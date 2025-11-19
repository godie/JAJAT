// chrome-extension/content.ts
// Content script to extract job data from job board pages

import { extractJobData as extractJobDataFromExtractors } from './job-extractors/index';

// Listen for messages from popup
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getJobData') {
      const jobData = extractJobDataFromExtractors();
      sendResponse({ data: jobData });
    } else if (request.action === 'syncOpportunity') {
      // Sync opportunity to web app localStorage
      syncToWebApp(request.data);
      sendResponse({ success: true });
    }
    return true; // Keep message channel open for async response
  });
}

// Legacy export for backward compatibility (delegates to extractor system)
export function extractJobData() {
  return extractJobDataFromExtractors();
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

