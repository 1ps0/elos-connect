

BSStrategy = (function() {
    return {
        _init: function() {
            window.location.assign(function() {
                var id_hack = 'X_BeardedSpice_Chrome_ApplescriptHack';
                var element = document.getElementById(id_hack);
                if (element === null) {
                    node = document.createElement('pre');
                    node.id = id_hack;
                    node.hidden = true;
                    document.getElementsByTagName('body')[0].appendChild(node);
                }
                element.innerText = JSON.stringify({
                    'hackResult': result['hackResult']
                });
            });
        },
        _result: function() {
            var element = document.getElementById('X_BeardedSpice_Chrome_ApplescriptHack');
            return element ? JSON.parse(element.innerText) : {};
        },
        _delete: function() {
            try {
                document.getElementById('X_BeardedSpice_Chrome_ApplescriptHack').remove()
                return true;
            } catch {
                console.log("caught remove")
                return false;
            }
        }
    };
})();

// window.addEventListener("click", notifyExtension);

// function notifyExtension(e) {
//   if (e.target.tagName != "A") {
//     return;
//   }
//   browser.runtime.sendMessage({"url": e.target.href});
// }

// function _() {

//   let myPort = browser.runtime.connect({name:"port-from-cs"});
//   myPort.postMessage({greeting: "hello from content script"});

//   myPort.onMessage.addListener(function(m) {
//     console.log("In content script, received message from background script: ");
//     console.log(m.greeting);
//   });

//   document.body.addEventListener("click", function() {
//     myPort.postMessage({greeting: "they clicked the page!"});
//   });
// }