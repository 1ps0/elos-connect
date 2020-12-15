<script>

import { onMount, createEventDispatcher, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";
import { linker } from "./lib/linker.js";

const dispatch = createEventDispatcher();
const filetypeContext = getContext("filetypes");
const registeredActions = getContext("registeredActions");

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

async function fetchFileList(params) {
  let actions = await get(registeredActions);
  let data = await actions.fetch("/api/file/search", params);
  metadata = (({ files, ...rest }) => rest)(data);
  files = data.files;
  console.log("processed metadata", data, files, metadata);
}

export let selectedFiles = [];
export const fileSelect = (node, params) => {
  return {
    update(val) {

    },
    destroy() {

    }
  };
};
function addToPackage(e, file) {
  console.log('addToPackage', e);
  e.target.parentElement.parentElement.parentElement.hidden = true;

  selectedFiles.push(file)
  selectedFiles = selectedFiles;
}

onMount(() => {
  console.log('Files mounted');
  filetypeContext.subscribe( (val) => {
    console.log("sub:fileset:filetypes", val, metadata);
    fetchFileList({ ...metadata, filetype: val });
  });
});

</script>

<div>
  <table>
    <tr>
      <td>
        <div class="filename">
          <span>{metadata.filetype}</span>
          <span>{pageOffset} - {pageOffset + metadata.pageSize} ({files.length})</span>
        </div>
      </td>
      <td>
        <form on:submit|preventDefault={
          (e) => {
              fetchFileList({...metadata, pageNum: 1});
            }
          }>
          <input name="keywords" bind:value={metadata.keywords} />
          <label id="keyword-value">{metadata.keywords}</label>
        </form>
      </td>
      <td>
        <button class="next-button" on:click|preventDefault={() => metadata.pageNum += 1}>
          Next Page
        </button>
      </td>
    </tr>
  </table>
  <table id="container-files">
    <tr>
      <th class="file-name">name</th>
      <!-- <th class="file-mime">mime | ext</th> -->
      <th class="file-open">open</th>
      <!-- <th class="file-options">options</th> -->
    </tr>
  {#each files as file}
    <tr>
      <td name="file-name" class="file-name">{file['file.title']}</td>
      <td name="file-open" class="file-open">
        <button use:linker={file}>open</button>
      </td>
      <td name="file-options" class="file-options">
        <button use:fileSelect={selectedFiles}>add</button>
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

/* -------------
   Sticky Header
*/


</style>

