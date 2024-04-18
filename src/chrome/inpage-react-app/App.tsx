import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
            console.log(document.location.href);
            // TODO: open sidePanel
          }}
        >
          Decode
        </button>,
        statusContainer
      )
    : null;
}

export default App;
