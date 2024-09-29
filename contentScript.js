// Select all 'a' elements on the page and convert the NodeList to an Array
let urls = Array.from(document.querySelectorAll('a'))
    // Extract the 'href' attribute from each 'a' element
    .map(a => a.href);

// Send a message to the extension's background script
chrome.runtime.sendMessage({
    // Specify the action as "copyUrls"
    action: "copyUrls",
    // Include the array of URLs in the message
    urls: urls
});