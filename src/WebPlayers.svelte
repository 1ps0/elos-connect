<script>

import { onMount } from 'svelte';

import ItemList from "./ItemList.svelte";


let showType = ['audio', 'video'];
let items = [];
let playingTabs = [];
$: items = [...playingTabs, ...[]];

/*
TODO

1. add ItemList integration
2. add click response to play/pause
3. add click response to goto tab
4. add "hide tab"
5. add "pin tab"
6. add "bookmark tab"
7. add "download tab"

*/

const movePlayingToCurrent = (e) => {
    let id = e.target.tabId;
    // browser.
};

const sendPlayPause = () => { console.log("sending playpause"); };

const updatePlaying = () => {
    // playingTabs = [];
    // TODO if detect tab change
    // TODO watch specific tabs
    browser.tabs.query({ audible: true}).then((tabs) => {
        console.log("querying audible:", tabs);
        playingTabs = tabs.map((tab) => {
            return {
                tabId: tab.id,
                windowId: tab.windowId,
                muted: tab.mutedInfo.muted,
                title: tab.title,
                url: tab.url,
            };
        })
    })
}


onMount(async () => {
  console.log('WebPlayers mounted');
  updatePlaying()
});

</script>

<section>
    <ItemList
        readonly=true
        bind:items
        on:didClick={sendPlayPause}
        titleKey="title"
    />
</section>

<style>

.player {
    border:  1px;
    padding:  0;
    margin:  0;
}

</style>
