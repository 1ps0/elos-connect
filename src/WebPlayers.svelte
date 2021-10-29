<script>

import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

import { reduceAudibleTabs, printFailure } from "./lib/apis.js";
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

const sendPlayPause = (e) => {
  const tabData = e.detail;
  console.log("sending playpause", tabData);
  browser.tabs.sendMessage(tabData.tabId, "playPause")
  .then((response) => {
    console.log("Got playpause response", response);
  })
  .catch(printFailure);
};

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
  }).catch(printFailure);
};


const handlePlayerUpdate = (request, sender, sendResponse) => {
  console.log("Message: ", request, sender);
  updatePlaying();
  sendResponse({
    response: "Response from WebPlayers"
  });
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
const bringToFront = (e) => {
  const tabData = e.detail;
  browser.tabs.update(tabData.tabId, { active: true });
  browser.windows.update(tabData.windowId, { focus: true });
}

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
    on:didClick={bringToFront}
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
