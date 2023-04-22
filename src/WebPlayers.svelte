<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import * as actions from "./lib/actions.js";
  import * as send from "./lib/send.js";
  import * as proxy from "./lib/apis/proxy.js";
  import ItemList from "./ItemList.svelte";

  let showType = ['audio', 'video'];
  const tabStore = writable([]);

  const handlePlayerUpdate = (request, sender, sendResponse) => {
    console.log("Message: ", request, sender);
    if (request.type === "playingStateChanged") {
      // Update the playing state of the corresponding tab
      tabStore.update((tabs) =>
        tabs.map((tab) =>
          tab.id === request.tabId ? { ...tab, playing: request.playing } : tab
        )
      );
    } else {
      return actions.updatePlaying(tabStore)
        .then((params) => ({
          params: params,
          response: "Response from WebPlayers"
        }))
        .then(sendResponse)
        .catch(proxy.print.failure);
    }
  };

  const buttonProps = [
    {
      name: 'show',
      description: '',
      check: (obj) => true,
      icon: () => 'Show',
      action: actions.bringToFront
    },
    {
      name: 'playPause',
      description: '',
      check: (obj) => obj.playing,
      icon: (obj) => {
        return obj.playing ? 'Pause' : 'Play';
      },
      action: send.playPause
    },
    {
      name: 'toggleLoop',
      description: '',
      check: (obj) => obj.loop,
      icon: (obj) => {
        return obj.loop ? 'LOOPING' : 'SINGLE';
      },
      action: send.toggleLoop
    }
  ];

  onMount(async () => {
    proxy.print.success_WebPlayers_mounted();
    browser.runtime.onMessage.addListener(handlePlayerUpdate);
    actions.updatePlaying(tabStore);
  });
</script>

<div class="w-full h-full">
  <ItemList
    readonly
    dataStore={tabStore}
    on:didClick={actions.bringToFront}
    titleKey="title"
    buttons={buttonProps}
  />
</div>
