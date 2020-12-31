<script>

import { onMount, createEventDispatcher } from 'svelte';
import { writable, get } from "svelte/store";

import ItemList from "./ItemList.svelte";

import { filesWritable } from "./lib/stores.js";
import { fileSelect, fileList } from "./lib/apis.js";

import { linker } from "./lib/linker.js";

const dispatch = createEventDispatcher();

// { "filetype": "pdf", "files": [], 'pageNum': 1, 'pageSize': 20}
export let files = [];
export let metadata = {
  pageSize: 10,
  pageNum: 1,
  filetype: 'md',
  keywords: ''
};
export let pageOffset = 0;

$: pageOffset = (metadata.pageNum - 1) * metadata.pageSize;
$: files, metadata;

function submitUpdates(e) {
  console.log("Files submitUpdates", e);
  // filesWritable.update((n) => n.keywords = );
  fileList(...metadata);
}

function incrementPage(e) {
  console.log("Files incrementPage", e);
  filesWritable.update((n) => ({
    ...n,
    pageNum: (n.pageNum + 1),
    dirty: true
  }));
}

function addToPackage(e, file) {
  console.log('addToPackage', e);
  e.target.parentElement.parentElement.parentElement.hidden = true;

  // selectedFiles.push(file)
  // selectedFiles = selectedFiles;
}

onMount(() => {
  console.log('Files mounted');

  filesWritable.subscribe((val) => {
    console.log("Files subscription got update", val);
    if (val !== undefined && !val.dirty) {
      files = val.files;
      metadata = (({ files, ...rest }) => rest)(val);
    }
  });
});

</script>

<div>
  <table>
    <tr>
      <td>
        <div class="filename">
          <span>{metadata.filetype}</span>
          <span>{pageOffset} - {pageOffset + metadata.pageSize} ({(files || []).length})</span>
        </div>
      </td>
      <td>
        <form on:submit|preventDefault={submitUpdates}>
          <input name="keywords" bind:value={metadata.keywords}/>
          <label id="keyword-value">{metadata.keywords}</label>
        </form>
      </td>
      <td>
        <button class="next-button" on:click|preventDefault={incrementPage}>
          Next Page
        </button>
      </td>
    </tr>
  </table>
  <table id="container-files">
    <tr>
      <th class="file-name">name</th>
      <th class="file-open">action</th>
    </tr>
  {#each files as file}
    <tr>
      <td name="file-name" class="file-name">{file['file.title']}</td>
      <td name="file-open" class="file-open">

      </td>
      <td name="file-options" class="file-options">
        <!-- <button use:fileSelect={selectedFiles}>add</button> -->
      </td>
    </tr>
  {/each}
  <ul>
</div>

<style>

.file-name {
  width:15%;
  padding: 5px;
  margin: 2px;
}

.file-mime {
  width:20%;
  padding: 5px;
  margin: 2px;
}

.file-open {
  width:5%;
  padding: 5px;
  margin: 2px;
}

.file-keywords {
  width:10%;
  padding: 5px;
  margin: 2px;
}


p {
  color: #ff3e00;
  text-transform: uppercase;
  font-size: 1em;
  font-weight: 100;
}

.next-button {
  /*width: 95%;*/
  border: 1px solid #aaa;
  border-radius: 2px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  padding: 0.5em;
  margin: 0 0.5em 0 0;
}

.filename {
  color: blue;
  text-transform: uppercase;
  font-size: 1em;
  font-weight: 100;
  max-width: 300px;
  overflow-wrap: normal;
}

.status {
  color: #ff3e00;
  text-transform: uppercase;
  font-size: 1.2em;
  font-weight: 100;
}

section {
  overflow: scroll;
}

table {
  text-align: left;
}
tr {
  color: black;
  font-size: 0.7em;
}
td {
  max-width: 200px;
}

</style>

