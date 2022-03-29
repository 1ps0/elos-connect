<script>

import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

import {
  bringToFront,
  updatePlaying,
  sendPlayPause,
  sendToggleLoop,
  print
} from "./lib/apis.js";
import ItemList from "./ItemList.svelte";

let showType = ['audio', 'video'];
const tabStore = writable([]); // local to this panel/page only

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


const handlePlayerUpdate = (request, sender, sendResponse) => {
  console.log("Message: ", request, sender);
  return updatePlaying(tabStore)
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

const buttonProps = [
  {
    name: 'show',
    description: '',
    icon: () => 'Show',
    action: bringToFront
  },
  {
    name: 'playPause',
    description: '',
    icon: (obj) => {
      return obj.playing ? 'Pause' : 'Play';
    },
    action: sendPlayPause
  },
  {
    name: 'toggleLoop',
    description: '',
    icon: (obj) => {
      return obj.loop ? 'LOOPING' : 'SINGLE';
    },
    action: sendToggleLoop
  }
];

onMount(async () => {
  console.log('WebPlayers mounted');
  browser.runtime.onMessage.addListener(handlePlayerUpdate);
  updatePlaying(tabStore);
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
