// Redmine Session Validity Checker - Background Service Worker

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('Redmine Session Validity Checker installed');
  
  // Set default settings
  chrome.storage.sync.get(['mode', 'domains'], (result) => {
    if (!result.mode) {
      chrome.storage.sync.set({
        mode: 'blacklist',
        domains: []
      });
    }
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['mode', 'domains'], (result) => {
      sendResponse(result);
    });
    return true; // Keep the message channel open for async response
  }
});
