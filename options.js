// Redmine Session Validity Checker - Options Script

// Translate UI
function translateUI() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const message = chrome.i18n.getMessage(element.getAttribute('data-i18n'));
    if (message) {
      element.textContent = message;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const message = chrome.i18n.getMessage(element.getAttribute('data-i18n-placeholder'));
    if (message) {
      element.placeholder = message;
    }
  });

  // Translate option elements
  document.querySelectorAll('option[data-i18n]').forEach(element => {
    const message = chrome.i18n.getMessage(element.getAttribute('data-i18n'));
    if (message) {
      element.textContent = message;
    }
  });
}

// Load settings
function loadSettings() {
  chrome.storage.sync.get(['mode', 'domains'], (result) => {
    document.getElementById('mode').value = result.mode || 'blacklist';
    renderDomainList(result.domains || []);
  });
}

// Render domain list
function renderDomainList(domains) {
  const domainList = document.getElementById('domainList');
  domainList.innerHTML = '';

  domains.forEach((domain, index) => {
    const domainItem = document.createElement('div');
    domainItem.className = 'domain-item';

    const domainText = document.createElement('span');
    domainText.textContent = domain;

    const removeButton = document.createElement('button');
    removeButton.textContent = chrome.i18n.getMessage('removeButton');
    removeButton.onclick = () => removeDomain(index);

    domainItem.appendChild(domainText);
    domainItem.appendChild(removeButton);
    domainList.appendChild(domainItem);
  });
}

// Add domain
function addDomain() {
  const newDomainInput = document.getElementById('newDomain');
  const newDomain = newDomainInput.value.trim();

  if (!newDomain) {
    return;
  }

  chrome.storage.sync.get(['domains'], (result) => {
    const domains = result.domains || [];
    
    // Check if domain already exists
    if (domains.includes(newDomain)) {
      showStatus(chrome.i18n.getMessage('domainAlreadyExists'), false);
      return;
    }

    domains.push(newDomain);
    chrome.storage.sync.set({ domains }, () => {
      renderDomainList(domains);
      newDomainInput.value = '';
    });
  });
}

// Remove domain
function removeDomain(index) {
  chrome.storage.sync.get(['domains'], (result) => {
    const domains = result.domains || [];
    domains.splice(index, 1);
    chrome.storage.sync.set({ domains }, () => {
      renderDomainList(domains);
    });
  });
}

// Save settings
function saveSettings() {
  const mode = document.getElementById('mode').value;

  chrome.storage.sync.set({ mode }, () => {
    showStatus(chrome.i18n.getMessage('settingsSaved'), true);
  });
}

// Show status message
function showStatus(message, isSuccess) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + (isSuccess ? 'success' : 'error');
  status.style.display = 'block';

  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  translateUI();
  loadSettings();

  document.getElementById('addDomain').addEventListener('click', addDomain);
  document.getElementById('newDomain').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addDomain();
    }
  });
  document.getElementById('saveButton').addEventListener('click', saveSettings);
});
