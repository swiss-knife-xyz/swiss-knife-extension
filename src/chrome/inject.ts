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

// to remove isolated modules error
export {};
