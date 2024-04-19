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

  const pageLoadedAtTimestamp = Date.now();

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
    } else if (Date.now() - pageLoadedAtTimestamp > 5_000) {
      // stop checking after 5 seconds
      clearInterval(statusCheckTimer);
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
          style={{
            background: "#e9ecef",
            color: "black",
            marginLeft: 10,
            paddingLeft: 0,
            paddingRight: 8,
            fontFamily: `"Roboto", system-ui, -apple-system, "Segoe UI", "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
            fontWeight: 500,
            borderRadius: 5,
            borderWidth: "1px",
            borderColor: "rgba(173, 181, 189, 0.25)",
          }}
          onClick={() => {
            callViaContentScript({
              type: "DECODE",
              msg: { tx: document.location.href },
            });
          }}
        >
          <img
            style={{
              height: "1.5rem",
              marginRight: "10px",
              borderRadius: "5px",
            }}
            src={`${(window as any).swissKnifeExtensionUrl}/img/logo.png`}
            alt="Logo"
          />
          Decode Calldata ▶️
        </button>,
        statusContainer
      )
    : null;
}

export default App;
