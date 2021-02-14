<script>

import { onMount, createEventDispatcher } from 'svelte';
import { writable, derived } from "svelte/store";

import ItemList from "./ItemList.svelte";

// stores.files, stores.history, stores.layoutItems
import { stores } from "./lib/stores.js";
import { fileSelect, fileList, openFile } from "./lib/apis.js";

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
$: files;
$: metadata;

function submitUpdates(e) {
  console.log("Files submitUpdates", e);
  fileList(...metadata);
}

function incrementPage(e) {
  console.log("Files incrementPage", e);
  stores.files.update((n) => ({
    ...n,
    pageNum: (n.pageNum + 1),
    dirty: true
  }));
}

onMount(() => {
  console.log('Files mounted');

  stores.files.subscribe((val) => {
    console.log("Files subscription got update", val);
    if (val !== undefined && !val.dirty) {
      files = val.files;
      metadata = (({ files, ...rest }) => rest)(val);
    }
  });
});

</script>

<div>
  <div class="filename">
    <span>{metadata.filetype}</span>
    <span>{pageOffset} - {pageOffset + metadata.pageSize} ({(files || []).length})</span>
  </div>
  <ItemList
    buttonName="Search"
    titleKey="file.title"
    on:didClick={openFile}
    dataStore={derived(stores.files, $a => $a.files)}
    inputEvent={(e) => submitUpdates(e)}
  />
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

