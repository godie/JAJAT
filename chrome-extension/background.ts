// chrome-extension/background.ts
// Background service worker for the extension

// Listen for installation
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      console.log('Job Application Tracker extension installed');
      // Could open a welcome page here
    }
  });

  // Listen for messages from content scripts or popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncOpportunities') {
    // Sync opportunities from chrome.storage.local to web app
    chrome.storage.local.get(['jobOpportunities'], (result) => {
      const opportunities = result.jobOpportunities || [];
      
      // Try to send to web app tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id && tab.url && (
            tab.url.includes('localhost') || 
            tab.url.includes('jajat.godieboy.com') || 
            tab.url.includes('127.0.0.1') || 
            tab.url.includes('job-application-tracker')
          )) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'syncOpportunities',
              data: opportunities,
            }).catch(() => {
              // Ignore errors if content script not available
            });
          }
        });
      });
    });
    
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open
  });
}

