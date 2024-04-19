// TODO: add context menu
// function setupContextMenu() {
//   chrome.contextMenus.create({
//     id: "explorers",
//     title: "Explorers",
//     contexts: ["selection"],
//   });
// }
// chrome.runtime.onInstalled.addListener(() => {
//   setupContextMenu();
// });

// Don't allow users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error(error));

chrome.contextMenus.onClicked.addListener((data, tab) => {
  // Store the last word in chrome.storage.session.
  chrome.storage.session.set({ lastWord: data.selectionText });

  if (tab) {
    // Make sure the side panel is open.
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

const getCurrentTab = async (callback: (tab: chrome.tabs.Tab) => void) => {
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    callback(tabs[0]);
  });
};

// Listen for messages from content script
chrome.runtime.onMessage.addListener(async (msgObj) => {
  console.log({ msgObj });
  switch (msgObj.type) {
    case "DECODE": {
      getCurrentTab((tab: chrome.tabs.Tab) => {
        // make sure side panel is open
        chrome.sidePanel.open({ tabId: tab.id });
      });
      break;
    }
    case "GET_CURRENT_URL": {
      getCurrentTab((tab: chrome.tabs.Tab) => {
        // Send the URL to the side panel
        chrome.runtime.sendMessage({
          type: "SP_GET_CURRENT_URL",
          msg: { url: tab.url },
        });
      });
    }
  }
});

// == Omnibox ==
// fires when select omnibox for extension
chrome.omnibox.onInputStarted.addListener(() => {
  chrome.omnibox.setDefaultSuggestion({
    description: "Explorer (address or tx):",
  });
});

// first when input changes e.g keyUp
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  let suggestions = [];
  if (isAddress(text) || text.includes(".eth") || isTransaction(text)) {
    suggestions.push({
      content: `https://explorer.swiss-knife.xyz/${text}`,
      description: `Explorer (address or tx): ${text}`,
    });
  }
  if (isHex(text)) {
    suggestions.push({
      content: `https://calldata.swiss-knife.xyz/decoder?calldata=${text}`,
      description: `Decode calldata: ${text}`,
    });
  }

  // selecting a suggestion will fill the address bar with the `content` and call `onInputEntered`
  suggest(suggestions);
});

// fires when select option and press enter
chrome.omnibox.onInputEntered.addListener((text) => {
  chrome.tabs.create({
    url: text.includes("https://")
      ? text
      : `https://explorer.swiss-knife.xyz/${text}`,
  });
});

const isTransaction = (tx: string) => {
  return /^0x([A-Fa-f0-9]{64})$/.test(tx);
};

const isHex = (value: string) => {
  if (!value) return false;
  if (typeof value !== "string") return false;
  return /^0x[0-9a-fA-F]*$/.test(value);
};

const isAddress = (address: string) => {
  const result = (() => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
    if (address.toLowerCase() === address) return true;
    return true;
  })();
  return result;
};
