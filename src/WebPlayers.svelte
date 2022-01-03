<script>

import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

import {
  bringToFront,
  reduceAudibleTabs,
  sendToContent,
  print
} from "./lib/apis.js";
import ItemList from "./ItemList.svelte";

let showType = ['audio', 'video'];
let tabStore = writable([]); // local to this panel/page only
/*
TODO

1. ~add ItemList integration~
2. ~add click response to play/pause~
3. add click response to goto tab
4. add "hide tab"
5. add "pin tab"
6. add "bookmark tab"
7. add "download tab"
*/


const reducePlaying = (tabs, obj) => {
  if (!tabs) { return null; }
  if (!obj) { obj = {}; }
  return tabs.reduce((_out, curr) => {
    if (!_out[curr.name]) {
      _out[curr.name] = curr;
    }
    return _out;
  }, obj);
};

const updatePlaying = () => {
  return browser.tabs.query({
    audible: true
  })
  .then(reduceAudibleTabs)
  .then((tabs) => {
    tabStore.update((knownTabs) => {
      return Object.values(
        reducePlaying(tabs, // second
          reducePlaying(knownTabs, {}) // first
        )
      );
    })
  }).catch(print.failure);
};

const handlePlayerUpdate = (request, sender, sendResponse) => {
  console.log("Message: ", request, sender);
  updatePlaying()
    .then((params) => ({
      params: params,
      response: "Response from WebPlayers"
    }))
    .then(sendResponse)
    .catch(print.failure);
};

/*
ADD state awareness:
- daily cycles
-

ADD FUNCTION BUTTONS:
1. play/pause
2. bring to front
3. download
*/

export const sendToggleLoop = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message:'toggleLoop' }))
    .then(sendToContent)
    .catch(print.failure);
}

export const sendPlayPause = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message:'playPause' }))
    .then(sendToContent)
    .catch(print.failure);
};


const buttonProps = [
  {
    name: 'show',
    description: '',
    icon: () => '👁',
    action: bringToFront
  },
  {
    name: 'playPause',
    description: '',
    icon: (obj) => {
      return obj.playing ? '⏸' : '▶️';
    },
    action: sendPlayPause
  },
  {
    name: 'toggleLoop',
    description: '',
    icon: (obj) => {
      console.log("LOGGING TOGGLELOOP", obj);
      return obj.loop ? '✅🔁' : '❌🔁';
    },
    action: sendToggleLoop
  }
];

onMount(async () => {
  console.log('WebPlayers mounted');
  browser.runtime.onMessage.addListener(handlePlayerUpdate);
  updatePlaying();
});

</script>

<section>
  <ItemList
    readonly=true
    dataStore={tabStore}
    titleKey="title"
    buttons={buttonProps}
  />
</section>

<style>

.player {
  border:  1px;
  padding:  0;
  margin:  0;
}

</style>
