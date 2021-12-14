
console.log("LOADING ELOS CONNECT - content_inject.js");

/*
GOALS

1. identify sites that match a BS strategy
2. retrieve state of tabs with identified sites
3. enable control of identified tabs through identified strategy

extras:
- infer dark mode
- extract article text
-

*/

/*
## PLAYABLE-ness

```
{
  baseURI:str
  muted:bool, volume:float
  playbackRate:int
  currentTime:float, duration:float
  loop:bool, ended:bool, autoplay:bool, paused:bool
  play:(), pause:(),
}
```

> BS interface:
```
version
displayName
accepts: { method:None, format: "%K LIKE *site*", args: ["URL"] }
isPlaying
toggle
previous
next
pause
favorite
trackInfo: { image, track, artist, progress, favorited }
```
*/

import {
  createNotify,
  addPort, getPorts, //removePort,
  _fetch,
  printFailure,
  printSuccess
} from "./lib/apis.js";

// ----- Util

const isElementVisible = (element) => {
  let visible = element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length > 0;
  console.log("testing element visibility:", visible, element);
  return visible;
}


// ----- Element Select

const startElementTracking = () => {
  // Document.elementFromPoint()
}
const stopElementTracking = () => {};

// ----- Media Control

const getPlayable = () => {
  return Promise.resolve(['video', 'audio'].reduce((_out, _type) => {
    return [
      ..._out,
      ...Array.from(
        document.querySelectorAll(_type))
          .filter((el) => isElementVisible(el))
    ];
  }, []));
};

const playPause = () => {
  return getPlayable().then((playing) => {
    console.log("Playing and Pausing", playing);
    playing.forEach((item) => {
      if (item.paused) { item.play(); }
      else   { item.pause(); }
    });
    return playing;
  }).catch(printFailure);
};

const getPlayingInfo = (playing) => {
  return playing.map((obj) => {
    return {
      url: obj.src,
      autoplay: obj.autoplay,
      autopip: obj.autopictureinpicture,
      paused: obj.paused,
      muted: obj.muted,
      loop: obj.loop,
      currentTime: obj.currentTime,
      duration: obj.duration
    }
  });
}

const renderPlayingStatus = (playing) => {
  if (playing.length > 0) {
    return {
      playable: playing.map((obj) => {
        return {
          ...obj,
          hasPlayable: true,
        }
      }),
      url: window.location.href
    };
  }
};

// ------ Text handling / searching

/**
 * Get all the text nodes into a single array
 */
function getNodes() {
  let walker = document.createTreeWalker(document, window.NodeFilter.SHOW_TEXT, null, false);
  let nodes = [];
  while(node = walker.nextNode()) {
    nodes.push(node);
  }

  return nodes;
}

/**
 * Gets all text nodes in the document, then for each match, return the
 * complete text content of nodes that contained the match.
 * If a match spanned more than one node, concatenate the textContent
 * of each node.
 */
function getContexts(ranges) {

  let contexts = [];
  let nodes = getNodes();

  for (let range of ranges) {
    let context = nodes[range.startTextNodePos].textContent;
    let pos = range.startTextNodePos;
    while (pos < range.endTextNodePos) {
      pos++;
      context += nodes[pos].textContent;
    }
    contexts.push(context);
  }
  return contexts;
}

// ----- Init

// unused
const initFinderResults = () => {
  let backgroundPage = browser.extension.getBackgroundPage();
  document.getElementById("find-form").addEventListener("submit", function(e) {
    // Send the query from the form to the background page.
    backgroundPage.find(document.getElementById("find-input").value);
    e.preventDefault();
  });

  let results = document.getElementById("result-list");

  function handleMessage(request, sender, response) {
    // Handle responses coming back from the background page.
    if (request.msg === "clear-results") {
      results.innerHTML = "";
    }
    if (request.msg === "found-result") {
      // List out responses from the background page as they come in.
      let li = document.createElement("li");
      li.innerText = `Tab id: ${request.id} at url: ${request.url} had ${request.count} hits.`;
      results.appendChild(li);
    }
  }

  browser.runtime.onMessage.addListener(handleMessage);
}

const initPlayer = () => {
  console.log("[CONTENT] Init Player");

  function handleMessage(request, sender, sendResponse) {
    console.log("Message from the page script:", request, sender, sendResponse);
    if (request === 'playPause') {
      return playPause()
        .then(getPlayingInfo)
        .then(renderPlayingStatus)
        .then(sendResponse)
        .catch(printFailure);
    }
  }

  browser.runtime.onMessage.addListener(handleMessage);
}

const initFinder = () => {
  console.log("[CONTENT] Init Finder");

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[CONTENT] got message:", message);
    sendResponse(getContexts(message.ranges));
  });
}


try {
  console.log('content_inject.js mounted');

  // browser.runtime.onConnect.addListener(addPort);

  initPlayer();

  initFinder();

  console.log("content_inject.js finished mounting")
} catch (e) {
  console.log("Caught content_inject.js init error", e);
};
