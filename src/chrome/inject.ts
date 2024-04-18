const init = async () => {
  // inject inpage.js into webpage
  try {
    let script = document.createElement("script");
    script.setAttribute("type", "module");
    const swissKnifeExtensionUrl = chrome.runtime.getURL(`/`).slice(0, -1); // slice the trailing `/`
    script.src = `${swissKnifeExtensionUrl}/static/js/inpage-react-app.js`;
    script.onload = async function () {
      // @ts-ignore
      this.remove();

      // send url to injected react app
      window.postMessage(
        {
          type: "swissKnifeExtensionUrl",
          msg: {
            swissKnifeExtensionUrl,
          },
        },
        "*"
      );
    };
    document.head
      ? document.head.prepend(script)
      : document.documentElement.prepend(script);
  } catch (e) {
    console.log(e);
  }
};

init();

const sendRes = (type: string, res: any) => {
  window.postMessage(
    {
      type: `res_${type}`,
      msg: {
        res,
      },
    },
    "*"
  );
};

// Receive messages from injected react-app
window.addEventListener("message", async (e) => {
  // only accept messages from us
  if (e.source !== window) {
    return;
  }

  if (!e.data.type) {
    return;
  }

  switch (e.data.type) {
    case "DECODE": {
      const tx = e.data.msg.tx as string;

      // Send a message to the background script
      chrome.runtime.sendMessage({
        type: "DECODE",
        msg: { tx },
      });

      sendRes(e.data.type, true);
    }
  }
});

// to remove isolated modules error
export {};
