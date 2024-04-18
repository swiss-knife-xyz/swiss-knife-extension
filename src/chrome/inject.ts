const init = async () => {
  // inject inpage.js into webpage
  try {
    let script = document.createElement("script");
    script.setAttribute("type", "module");
    script.src = chrome.runtime.getURL("/static/js/inpage-react-app.js");
    script.onload = async function () {
      // @ts-ignore
      this.remove();

      // TODO:
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
