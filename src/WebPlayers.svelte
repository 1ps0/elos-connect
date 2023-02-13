<script>

import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

import {
  bringToFront,
  updatePlaying,
  sendPlayPause,
  sendToggleLoop,
} from "./lib/actions.js";
import * as proxy from "./lib/apis/proxy.js";

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
    .catch(proxy.print.failure);
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
    check: (obj) => true,
    icon: () => 'Show',
    action: bringToFront
  },
  {
    name: 'playPause',
    description: '',
    check: (obj) => obj.playing,
    icon: (obj) => {
      return obj.playing ? 'Pause' : 'Play';
    },
    action: sendPlayPause
  },
  {
    name: 'toggleLoop',
    description: '',
    check: (obj) => obj.loop,
    icon: (obj) => {
      return obj.loop ? 'LOOPING' : 'SINGLE';
    },
    action: sendToggleLoop
  }
];

onMount(async () => {
  proxy.print.success_WebPlayers_mounted()
  browser.runtime.onMessage.addListener(handlePlayerUpdate);
  // TODO on tab playing state changed, update
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

</style>
