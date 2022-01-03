<script>

import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

import {
  createNotifySuccess,
  printSuccess,
  printFailure
} from "./lib/apis.js";
import ItemList from "./ItemList.svelte";

let playlistStore = writable({
  default: [],
  music: [],

});

onMount(async () => {
  console.log('Playlists mounted');


});

</script>

<section>
  <ItemList
    readonly=true
    dataStore={playlistStore}
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
