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
import { writable, get, derived } from 'svelte/store';

import ItemList from "./ItemList.svelte";
import {
  createNotifySuccess,
  print,
} from "./lib/apis.js";


let storeKey = 'stash';
let playlistStore = writable({});
// let renderedPlaylistStore = derived(playlistStore, $playlistStore => $playlistStore.map(()))
// playlistStore.subscribe((val) => {
//   console.log("PLAYLIST UPDATE", val);
// });

let inputFilter = null;
$: updatePlaylistStore(inputFilter);


const updatePlaylistStore = (_inputFilter) => {
  return browser.storage.local.get()
    // .then((result) => result.stash)
    .then((result) => Object.values(result).flat(1))
    .then((result) => {
      return result.filter((item) => {
        if (_inputFilter && _inputFilter.length > 1) {
          return (item.label ? item.label : "").indexOf(_inputFilter) != -1;
        } else {
          return true;
        }
      })
    })
    .then((items) => playlistStore.update((_items) => items))
    .catch(print.failure_stash_playlist_get);
}


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
    // buttons={itemButtons}

onMount(async () => {
  console.log('Playlists mounted');
  updatePlaylistStore();
});

</script>

<section>
  <p><input bind:value={inputFilter} type="text"/></p>
  <ItemList
    readonly=true
    deletable=true
    dataStore={playlistStore}
    titleKey="label"
    on:didClick={openLink}
  />
</section>

<style>

.player {
  border:  1px;
  padding:  0;
  margin:  0;
}

</style>
