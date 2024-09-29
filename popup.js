// Add event listeners when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // Attach click event listeners to buttons
  document.getElementById('groupTabs').addEventListener('click', groupTabs);
  document.getElementById('closeDuplicates').addEventListener('click', closeDuplicates);
  document.getElementById('copyTabURLs').addEventListener('click', copyTabURLs);
  document.getElementById('randomizeTabs').addEventListener('click', randomizeTabs);
});

// Function to group tabs by base domain, then subdomain, retaining original order within groups
function groupTabs() {
  // Query all open tabs in the current window
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    // Create an object to store grouped tabs
    let groupedTabs = {};

    // Group tabs by base domain and subdomain
    tabs.forEach(function (tab) {
      let url = new URL(tab.url);
      let parts = url.hostname.split('.');
      let baseDomain = parts.slice(-2).join('.');
      let subdomain = parts.slice(0, -2).join('.');

      if (!groupedTabs[baseDomain]) {
        groupedTabs[baseDomain] = {};
      }
      if (!groupedTabs[baseDomain][subdomain]) {
        groupedTabs[baseDomain][subdomain] = [];
      }
      groupedTabs[baseDomain][subdomain].push(tab);
    });

    // Create a new order of tabs
    let newOrder = [];
    Object.keys(groupedTabs).sort().forEach(function (baseDomain) {
      Object.keys(groupedTabs[baseDomain]).sort().forEach(function (subdomain) {
        newOrder = newOrder.concat(groupedTabs[baseDomain][subdomain]);
      });
    });

    // Move each tab to its new position
    newOrder.forEach(function (tab, index) {
      chrome.tabs.move(tab.id, { index: index });
    });
  });
}

// Function to close duplicate tabs
function closeDuplicates() {
  // Query all open tabs in the current window
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    // Create an object to store unique URLs
    var uniqueURLs = {};

    // Iterate through tabs to find and close duplicates
    tabs.forEach(function (tab) {
      var url = tab.url.toLowerCase();

      // Check if URL is already in the object
      if (uniqueURLs[url]) {
        // Close the duplicate tab
        chrome.tabs.remove(tab.id);
      } else {
        // Add the URL to the object
        uniqueURLs[url] = true;
      }
    });
  });
}

// Function to copy URLs of all tabs to clipboard
function copyTabURLs() {
  // Query all open tabs in the current window
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    // Extract URLs from the tabs
    var tabURLs = tabs.map(function (tab) {
      return tab.url;
    });

    // Copy the URLs to the clipboard
    navigator.clipboard.writeText(tabURLs.join('\n'))
      .then(function () {
        console.log('URLs copied to clipboard:', tabURLs);
      })
      .catch(function (error) {
        console.error('Error copying URLs to clipboard:', error);
      });
  });
}

// Function to randomize tab order
function randomizeTabs() {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    let shuffledTabs = tabs.sort(() => Math.random() - 0.5);
    shuffledTabs.forEach((tab, index) => {
      chrome.tabs.move(tab.id, { index: index });
    });
  });
}

// Add more event listeners when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Handle click on Generate URL List button
  document.getElementById('generate').addEventListener('click', function() {
    // Send a message to the background script to generate and download URL list
    chrome.runtime.sendMessage({ action: 'generateURLList' });
  });

  // Handle click on Open URLs button
  document.getElementById('openUrls').addEventListener('click', function() {
    const text = document.getElementById('urlList').value;
    // Regular expression to match URLs
    const urlRegex = /((https?|ftp):\/\/[^\s/$.?#].[^\s]*)/gi;

    let match;
    // Find all URLs in the text and open each in a new tab
    while ((match = urlRegex.exec(text)) !== null) {
      chrome.tabs.create({ url: match[0] });
    }
  });
});

// Handle click on Open URLs in New Window button
document.getElementById('openUrlsInNewWindow').addEventListener('click', function() {
  const text = document.getElementById('urlList').value;
  // Regular expression to match URLs
  const urlRegex = /((https?|ftp):\/\/[^\s/$.?#].[^\s]*)/gi;
  let urls = [];
  let match;
  // Find all URLs in the text
  while ((match = urlRegex.exec(text)) !== null) {
    urls.push(match[0]);
  }
  // Create a new window and open each URL in a new tab in this window
  chrome.windows.create({ url: urls });
});

// Handle click on Copy URLs button
document.getElementById('copyUrls').addEventListener('click', function() {
  // Get the active tab in the current window
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    // Execute the content script in the active tab
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['contentScript.js']
    });
  });
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "copyUrls") {
    // Join the URLs with newlines and copy to clipboard
    let urls = request.urls.join('\n');
    navigator.clipboard.writeText(urls);
  }
});
