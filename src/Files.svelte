<script>

import { onMount, createEventDispatcher } from 'svelte';
import { writable, derived } from "svelte/store";

import ItemList from "./ItemList.svelte";

// stores.files, stores.actionHistory, stores.layoutItems
import { stores } from "./lib/stores.js";
import { fileList, openFile } from "./lib/apis/files.js";


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
  print.success_Files_mounted();

  stores.files.subscribe((val) => {
    if (val && !val.dirty) {
      console.log("Files subscription got update", val);
      files = val.files || [];
      metadata = (({ files, ...rest }) => rest)(val);
    }
  });
});

</script>

<section>
  <div class="filename">
    <span>{metadata.filetype}</span>
    <span>{pageOffset} - {pageOffset + metadata.pageSize} ({(files || []).length})</span>
  </div>
  <ItemList
    buttonName="Search"
    titleKey="file.title"
    on:didClick={openFile}
    dataStore={stores.files}
    dataKey="files"
    inputEvent={(e) => submitUpdates(e)}
  />
</section>

<style>

.filename {
  color: blue;
  text-transform: uppercase;
  font-size: 1em;
  font-weight: 100;
  max-width: 300px;
  overflow-wrap: normal;
}

section {
  overflow: scroll;
}

</style>

