// Redmine Session Validity Checker - Content Script

let sessionCheckInterval = null;
let bannerElement = null;

// Get settings from storage
async function getSettings() {
  const result = await chrome.storage.sync.get({
    mode: 'blacklist', // 'whitelist' or 'blacklist'
    domains: []
  });
  return result;
}

// Check if current domain should be processed based on mode and domains list
function shouldProcessDomain(currentHostname, mode, domains) {
  const isInList = domains.some(domain => {
    const pattern = domain.replace(/\*/g, '.*');
    const regex = new RegExp('^' + pattern + '$');
    return regex.test(currentHostname);
  });

  if (mode === 'whitelist') {
    return isInList;
  } else {
    return !isInList;
  }
}

// Check if website is an instance of Redmine
function isRedmineInstance() {
  const footer = document.querySelector('html body div#wrapper div#footer');
  if (!footer) {
    return false;
  }
  return footer.textContent.includes('Powered by Redmine');
}

// Check if user is logged in
function isUserLoggedIn() {
  const myAccountLink = document.querySelector('a.my-account[href*="/my/account"]');
  return myAccountLink !== null;
}

// Check if user session is still valid
async function isSessionValid() {
  try {
    const myAccountLink = document.querySelector('a.my-account[href*="/my/account"]');
    if (!myAccountLink) {
      return false;
    }

    const accountUrl = myAccountLink.getAttribute('href');
    const reqResp = await fetch(accountUrl, {
      method: 'GET',
      credentials: 'same-origin'
    });

    const isExpired = reqResp.redirected === true || reqResp.url.indexOf('/login') !== -1;
    return !isExpired;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return true; // Assume valid if check fails
  }
}

// Get translated message
function getMessage(messageName) {
  return chrome.i18n.getMessage(messageName);
}

// Add warning banner
function addWarningBanner() {
  // Don't add banner if it already exists
  if (bannerElement && document.body.contains(bannerElement)) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'redmine-session-warning-banner';
  banner.textContent = getMessage('sessionExpiredWarning');
  banner.style.cssText = `
    z-index: 100000;
    background-color: #d32f2f;
    color: white;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    padding: 15px 20px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    cursor: pointer;
    text-align: center;
    font-weight: bold;
  `;

  banner.onclick = () => {
    if (banner.parentElement) {
      banner.parentElement.removeChild(banner);
    }
    bannerElement = null;
  };

  document.body.appendChild(banner);
  bannerElement = banner;

  // Stop checking after session expires
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
}

// Main execution function
async function startSessionMonitoring() {
  // Step 1: Wait for page to fully load (already handled by run_at: "document_idle")
  
  // Get settings
  const settings = await getSettings();
  
  // Check if domain should be processed
  const currentHostname = window.location.hostname;
  if (!shouldProcessDomain(currentHostname, settings.mode, settings.domains)) {
    console.log('Redmine Session Checker: Domain excluded by settings');
    return;
  }

  // Step 2: Check if website is an instance of Redmine
  if (!isRedmineInstance()) {
    console.log('Redmine Session Checker: Not a Redmine instance');
    return;
  }

  console.log('Redmine Session Checker: Redmine detected');

  // Step 3: Check if user is logged in
  if (!isUserLoggedIn()) {
    console.log('Redmine Session Checker: User not logged in');
    return;
  }

  console.log('Redmine Session Checker: User logged in, starting session monitoring');

  // Step 4: Every 5 minutes check if user session is still valid
  sessionCheckInterval = setInterval(async () => {
    const sessionValid = await isSessionValid();
    
    // Step 5: If session is invalidated, add banner
    if (!sessionValid) {
      console.log('Redmine Session Checker: Session expired');
      addWarningBanner();
    } else {
      console.log('Redmine Session Checker: Session still valid');
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Also do an immediate check
  const sessionValid = await isSessionValid();
  if (!sessionValid) {
    console.log('Redmine Session Checker: Session already expired');
    addWarningBanner();
  }
}

// Cleanup function
function cleanup() {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
  if (bannerElement && bannerElement.parentElement) {
    bannerElement.parentElement.removeChild(bannerElement);
    bannerElement = null;
  }
}

// Start monitoring when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startSessionMonitoring);
} else {
  startSessionMonitoring();
}

// Clean up when navigating away
window.addEventListener('beforeunload', cleanup);
