// Handle list generation
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'generateURLList') {
    // Query all tabs
    chrome.tabs.query({}, function(tabs) {
      // Extract URLs from all tabs
      const urls = tabs.map(tab => tab.url);
      // Join URLs with newlines
      const textToWrite = urls.join('\n');

      // Create a Blob (Binary Large Object) with the text content
      const blob = new Blob([textToWrite], { type: 'text/plain' });
      // Create a FileReader to read the Blob as a data URL
      const reader = new FileReader();

      // When FileReader finishes reading
      reader.onloadend = function() {
        // Get the data URL
        const dataUrl = reader.result;

        // Initiate download of the file
        chrome.downloads.download({
          url: dataUrl,
          filename: 'tab_urls.txt',
          saveAs: false  // This flag may prompt the browser to save without asking
        });
      };

      // Start reading the Blob as a data URL
      reader.readAsDataURL(blob);
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'downloadLargeImages') {
    // Extract URLs of large images from the message
    const largeImageUrls = request.urls;
    // Initiate downloads for each large image URL
    largeImageUrls.forEach(url => {
      chrome.downloads.download({ url: url });
    });
  }
});

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
  // This listener is kept empty as it previously referenced the tabs page
  // It's here in case future functionality needs to be added for icon clicks
});