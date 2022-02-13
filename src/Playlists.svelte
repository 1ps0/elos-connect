<script>
/*
DESIGN

advanced form of stash
select storeKeys
add storeKey
sync with remote store
remote stores are grouped by playlist storekey

*/

import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

import {
  createNotifySuccess,
  print
} from "./lib/apis.js";
import ItemList from "./ItemList.svelte";

let playlistStore = writable([]);
playlistStore.subscribe((val) => {
  console.log("PLAYLIST UPDATE", val);
});

let storeKey = 'stash';


const updatePlaylistStore = () => {
  return Promise.resolve(storeKey)
    .then(browser.storage.local.get)
    .then((result) => result[storeKey])
    .then((tabs) => playlistStore.update((n) => tabs))
    .catch(print.failure_stash_playlist_get);
}
$: updatePlaylistStore();


const openLink = (e) => {
  Promise.resolve(e.detail)
    .then((data) => ({
      // TODO can set in new window, position of tab, etc
      url: data.uri,
      active: true,
    }))
    .then(browser.tabs.create)
    .catch(print.failure_playlists_open_link)

};

const itemButtons = [];
//   {
//     name: "",
//     icon: (item) => JSON.stringify(item),
//     action: (item) => {
//       // TODO "open in new window"
//       // TODO "open in new tab"
//       // TODO "open here"
//       // TODO "remove this"
//     },
//   },
// ];

onMount(async () => {
  console.log('Playlists mounted');
  updatePlaylistStore()
});

</script>

<section>
  <ItemList
    readonly=true
    dataStore={playlistStore}
    titleKey="label"
    on:didClick={openLink}
    buttons={itemButtons}
  />
</section>

<style>

.player {
  border:  1px;
  padding:  0;
  margin:  0;
}

</style>
