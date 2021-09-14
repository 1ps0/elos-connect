<script>
/*
"file.ext": "pdf"
"file.mime": "application/pdf"
"file.size": "3106219"
"file.title": "action_grammars.pdf"
"hash.blake2b": "b727d3f48c2de108cc1160ed69a5e863edcb5ac5f320cf52133011d91a267a5c90d46ea8763e97bc27781eebf4512f4af7700974e4583b06adaf867fabfca358"
hits: Array(15) [ "grammar", "disk", "expert" ] // ...
"metadata.created_at": "1597371777"
"metadata.format": "1"
"metadata.version": "1"
*/
import { onMount } from 'svelte';
import { writable, get } from "svelte/store";
import { filesWritable, fileSelect, fileList } from "./lib/stores.js"
import { linker } from "./lib/linker.js";

export let file;

onMount(async () => {

});

</script>

<div class="container">

{#await filenames}
  <h2>Loading...</h2>
{:then _}

  <h2>{file['file.title']}</h2>

  {#each file_uris as uri}
    <div class="file_open" id="file-{i}" on:click={() => updateViewer(uri, i)}>
      <button use:linker={file}>open</button>

    </div>

  {/each}
  <div class="topics">
    <p>
    {#each topics as topic}
      <span class="topic">{topic} </span>
    {/each}
    </p>
  </div>

<!--
  <div class="neighbors">
  <hr class="full-width"/>
    {#each neighbors as neighbor}
      <h5>{neighbor[0]}</h5>
      <p>
        {#each neighbor[1] as topic}
          <span class="neighbor">{topic}</span>
        {/each}
      </p>
      <hr class="full-width"/>
    {/each}
  </div> -->
{/await}
</div>

<style>

.full-width hr {
}

.topics div {
}

.neighbors h5 {
  color: blue;
}

.neighbor {
  border: 1px solid #aaa;
  border-radius: 2px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  padding: 0.5em;
  margin: 0.25em;
  flex: 1;
  font-size: 0.8em;
  color: blue;
  background-color: #EEE;
}

.topic {
  border: 1px solid #aaa;
  border-radius: 2px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  padding: 0.5em;
  display: block;
  float: left;
  margin: 0.25em;
  flex: 1;
}

.container {
  width: 70%;
  border: 1px solid #aaa;
  border-radius: 2px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  padding: 1em;
  margin: 0 0 1em 0;
  display: flex;
  flex-direction: column;
}

.container h2,span {
  text-transform: uppercase;
  font-size: 1em;
  color: #ff3e00;
}

.container p {
  font-size: 0.7em;
  text-transform: uppercase;
  /*text-decoration: underline;*/
}

</style>
