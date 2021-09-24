

window.addEventListener("click", notifyExtension);

function notifyExtension(e) {
  if (e.target.tagName != "A") {
    return;
  }
  browser.runtime.sendMessage({"url": e.target.href});
}

function _() {

  let myPort = browser.runtime.connect({name:"port-from-cs"});
  myPort.postMessage({greeting: "hello from content script"});

  myPort.onMessage.addListener(function(m) {
    console.log("In content script, received message from background script: ");
    console.log(m.greeting);
  });

  document.body.addEventListener("click", function() {
    myPort.postMessage({greeting: "they clicked the page!"});
  });
}