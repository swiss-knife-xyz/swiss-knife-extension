function setupContextMenu() {
  chrome.contextMenus.create({
    id: "define-word",
    title: "Define",
    contexts: ["selection"],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
  // Store the last word in chrome.storage.session.
  chrome.storage.session.set({ lastWord: data.selectionText });

  // Make sure the side panel is open.
  chrome.sidePanel.open({ tabId: tab.id });
});

async function getCurrentTab(callback) {
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    callback(tabs[0]);
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener(async (msgObj) => {
  console.log({ msgObj });
  switch (msgObj.type) {
    case "DECODE": {
      getCurrentTab((tab) => {
        // make sure side panel is open
        chrome.sidePanel.open({ tabId: tab.id });
      });
      break;
    }
    case "GET_CURRENT_URL": {
      getCurrentTab((tab) => {
        // Send the URL to the side panel
        chrome.runtime.sendMessage({
          type: "SP_GET_CURRENT_URL",
          msg: { url: tab.url },
        });
      });
    }
  }
});
