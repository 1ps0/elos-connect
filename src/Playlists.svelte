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
playlistStore.subscribe((val) => {
  console.log("PLAYLIST UPDATE", val);
});

let inputFilter = "";

// FIXME trigger on update to inputFilter, not just playlistStore
export const filterList = (_in, key) => {
  try {
    if (key && key.length > 0) {
      let fit = _in.filter((x) => {
        return (x.label ? x.label : `${x}`)
          .toLowerCase()
          .indexOf(
            key.toLowerCase()
          ) != -1
      });
      console.log("FILTER LIST", key, fit, _in);
      return fit;
    } else {
      return _in;
    }
  } catch (err) {
    console.log('ERR', err);
    return _in;
  }
};



const updatePlaylistStore = (key) => {
  return Promise.resolve(storeKey)
    .then(browser.storage.local.get)
    .then((result) => result[storeKey])
    .then(print.status_update_playlist_store)
    .then((result) => filterList(result, key))
    .then((tabs) => {
      return playlistStore.update((n) => ({
        ...n,
        ...tabs.filter((store, tab) => {
          if (store[key] && store[key].length)
            store[key].append(tab)
          else {
            store[key] = [tab];
          }
          return store;
        }, {})
      }))
    })
    .catch(print.failure_stash_playlist_get);
}
$: updatePlaylistStore(inputFilter);


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
  updatePlaylistStore(inputFilter)
});

</script>

<section>
  <p><input bind:value={inputFilter} type="text"/></p>
  <ItemList
    readonly=true
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
