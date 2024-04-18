document.addEventListener("DOMContentLoaded", function () {
  decode();
});

const decode = async () => {
  // Request the current URL from the background script
  const url = await callViaServiceWorker({ type: "GET_CURRENT_URL" });
  const response = await fetch(
    "https://swiss-knife.xyz/api/calldata/decoder-recursive",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tx: url }),
    }
  );
  const decoded = await response.json();

  const textarea = document.getElementById("decoded");
  textarea.value = JSON.stringify(decoded, null, 2);
};

const callViaServiceWorker = (msgObj) => {
  return new Promise((resolve) => {
    // send message to service-worker
    chrome.runtime.sendMessage(msgObj);

    // receive from service-worker
    chrome.runtime.onMessage.addListener((request) => {
      switch (request.type) {
        case `SP_${msgObj.type}`: {
          const url = request.msg.url;

          resolve(url);
          break;
        }
      }
    });
  });
};
