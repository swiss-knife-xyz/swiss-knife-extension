import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const callViaContentScript = (msgObj: {
  type: string;
  msg: any;
}): Promise<any> => {
  return new Promise((resolve) => {
    // send message to content_script (inject.ts)
    window.postMessage(msgObj, "*");

    // receive from content_script (inject.ts)
    const controller = new AbortController();
    window.addEventListener(
      "message",
      (e: any) => {
        // only accept messages from us
        if (e.source !== window) {
          return;
        }

        if (!e.data.type) {
          return;
        }

        switch (e.data.type) {
          case `res_${msgObj.type}`: {
            const res = e.data.msg.res;

            // remove this listener to avoid duplicates in future
            controller.abort();

            resolve(res);
            break;
          }
        }
      },
      { signal: controller.signal } as AddEventListenerOptions
    );
  });
};

function App() {
  // explorer dom element container to inject swiss-knife decode button into
  const [statusContainer, setStatusContainer] = useState<any>(null);

  const checkIfExplorerLoaded = () => {
    console.log("Checking if explorer loaded...");

    // finding the badge next to status
    const _statusContainer = document
      .getElementById("ContentPlaceHolder1_maintable")
      ?.querySelector(".badge")?.parentElement;

    console.log({ _statusContainer });
    if (_statusContainer) {
      clearInterval(statusCheckTimer);

      // only inject button if we are on the transaction page
      if (document.location.pathname.split(/\/(?=.)/).includes("tx")) {
        setStatusContainer(_statusContainer);
      } else {
        statusContainer(null);
      }
    }
  };

  // wait for our target element to load
  let statusCheckTimer = setInterval(checkIfExplorerLoaded, 200);

  const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body");
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        if (oldHref !== document.location.href) {
          oldHref = document.location.href;

          // New URL now, so find & set the container again
          statusCheckTimer = setInterval(checkIfExplorerLoaded, 200);
        }
      });
    });
    observer.observe(body!, { childList: true, subtree: true });
  };

  useEffect(() => {
    observeUrlChange();
  }, []);

  useEffect(() => {
    console.log({ statusContainer });
  }, [statusContainer]);

  return statusContainer
    ? createPortal(
        <button
          onClick={() => {
            callViaContentScript({
              type: "DECODE",
              msg: { tx: document.location.href },
            });
          }}
        >
          Decode
        </button>,
        statusContainer
      )
    : null;
}

export default App;
