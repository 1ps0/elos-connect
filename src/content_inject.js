
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

// import { Readability } from '@mozilla/readability';

import {
  setupRelay,
  _fetch,
  print
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
  return Promise.resolve(['video', 'audio'])
    .then((types) => {
      return types.reduce((_out, _type) => {
        return [
          ..._out,
          ...Array.from(
            document.querySelectorAll(_type))
              .filter((el) => isElementVisible(el))
        ];
      }, []);
    })
    .catch(print.failure_get_playable);
};

const toggleLoop = () => {
  return getPlayable()
    .then((playing) => {
      playing.forEach((item) => {
        item.loop = !item.loop;
      });
      return playing;
    })
    .catch(print.failure_toggle_loop);
}

const playPause = () => {
  return getPlayable().then((playing) => {
      console.log("Playing and Pausing", playing);
      playing.forEach((item) => {
        if (item.paused) { item.play(); }
        else   { item.pause(); }
      });
      return playing;
    })
    .catch(print.failure_play_pause);
};


const restart = () => {
  return getPlayable().then((playing) => {
      console.log("Restarting", playing);
      playing.forEach((item) => {
        item.currentTime = 0;
      });
      return playing;
    })
    .catch(print.failure_play_pause);
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
          playing: !obj.paused,
          loop: obj.loop,
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
function getContent(ranges) {

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

function extractReaderText() {
  return {
    title: document.querySelector('.reader-title h1').value,
    link: document.querySelector('.reader-domain a').href,
    readerTime: document.querySelector('.reader-estimated-time').value,
    contentBody: document.querySelectorAll('.page')
  };
}

function handleMessage(request, sender, sendResponse) {
  console.log("[CONTENT] Message from the page script:", request, sender, sendResponse);
  if (request.message === 'playPause') {
    return playPause()
      .then(getPlayingInfo)
      .then(renderPlayingStatus)
      .then(sendResponse)
      .catch(print.failure_handle_message_playpause);

  } else if (request.message === 'find') {
    return Promise.resolve(request)
      .then(getContent)
      .then(print.status_find)
      .then((findObj) => {
        return findObj;
      })
      .then(sendResponse)
      .catch(print.failure_handle_message_find);
  } else if (request.message === 'toggleLoop') {
    return toggleLoop()
      .then(getPlayingInfo)
      .then(renderPlayingStatus)
      .then(sendResponse)
      .catch(print.failure_handle_message_toggleloop);
  } else if (request.message === 'restart') {
    return restart()
      .then(getPlayingInfo)
      .then(renderPlayingStatus)
      .then(sendResponse)
      .catch(print.failure_handle_message_restart);
  } else if (request.message = "extractReaderText") {
    return extractReaderText()
      .then(sendResponse)
      .catch(print.failure_handle_message_extract_reader_text);
  }
}

try {
  print.success_content_inject.js_mounted();
  browser.runtime.onMessage.addListener(handleMessage);
  console.log("content_inject.js finished mounting")
} catch (e) {
  console.log("Caught content_inject.js init error", e);
};
