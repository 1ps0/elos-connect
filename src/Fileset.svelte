<script>

import { onMount, createEventDispatcher } from 'svelte';
import { linker } from "./lib/linker.js";

import SelectList from "./SelectList.svelte";

const dispatch = createEventDispatcher();

// { "filetype": "pdf", "files": [], 'pageNum': 1, 'pageSize': 20}
export let files = [];
export let pageNum = 1;
export let pageSize = 10;
export let pageOffset = (pageNum - 1) * pageSize;
export let keywords = '';
export let selectedExtension = 'md';
export let filetype = '';

$: selectedExtension;
$: keywords;
$: files;

async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  cb(await ret.json());
};

async function fetchFileList(page, fType='', keywords='') {
  const url = new URL("/api/file/search", "http://localhost:8080");

  url.searchParams.append("pageSize", pageSize);
  url.searchParams.append("pageNum", page);
  if (keywords.length > 0) {
    url.searchParams.append("keywords", keywords);
  }
  if (fType.length > 0) {
    url.searchParams.append("filetype", fType);
  }

  await fetch_(url.href, (ret) => {
    console.log(ret);
    filetype = ret.filetype;
    files = ret.files;
    pageNum = ret.pageNum;
    pageSize = ret.pageSize;
    pageOffset = ret.pageOffset;
    keywords = ret.keywords || '';
  });
}

function add_to_package(e, file) {
  console.log('add_to_package', e);
  e.target.parentElement.parentElement.parentElement.hidden = true;

  selectedFiles.push(file)
  selectedFiles = selectedFiles;
}

onMount(() => {
  console.log('Fileset mounted');
  fetchFileList(1, selectedExtension, keywords);
});

</script>

<div>
  <table>
    <tr>
      <td>
        <div class="filename">{filetype}
          {pageOffset} - {pageOffset + pageSize} ({files.length})
        </div>
      </td>
      <td>
        <form on:submit={
          (e) => {
              e.preventDefault();
              console.log(e);
              pageNum = 1;
              fetchFileList(pageNum, filetype, keywords);
            }
          }>
          <input name="keywords" on:input={
            (e) => {
              let el = document.getElementById("keyword-value");

              keywords = e.target.value;
              el.innerHTML = keywords;
            }
          }/>
          <label id="keyword-value">{keywords}</label>
        </form>
      </td>
      <td>
        <button class="next-button" on:click|preventDefault={() => fetchFileList(pageNum+1, filetype, keywords)}>
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
      <!-- <td name="file-options" class="file-options">
        <div>
          <button on:click|preventDefault="{(e) => add_to_package(e, file)}">add to package</button>
        </div>
      </td> -->
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

