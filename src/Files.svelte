<script>

import { onMount, createEventDispatcher } from 'svelte';
import { writable, derived } from "svelte/store";

import ItemList from "./ItemList.svelte";

import { filesWritable, historyWritable, layoutItemsWritable } from "./lib/stores.js";
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
$: files;
$: metadata;

function submitUpdates(e) {
  console.log("Files submitUpdates", e);
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

const selectedFile = (item) => item ? item['locations'][0].split('/Volumes/ARCHIVE/')[1] : "";
const selectedFilePath = (item) => `/api/load?filepath=${selectedFile(item)}`;

function openFile(e) {
  console.log('open file', e);
  let data = e.detail;
  let target;

  if (["md", "txt", "json"].indexOf(data['file.ext']) != -1) {
    target = "panel-editor";
  }
  else if (data['file.ext'] === "pdf") {
    target = "panel-pdf";
  }
  else if (["jpg", "gif", "png"].indexOf(data['file.ext']) != -1) {
    target = "panel-gallery";
  }

  if (target !== undefined) {
    let options = {
      target_name: target,
      props: {
        data: selectedFilePath(data)
      }
    };
    console.log("data for open file", options);

    // historyWritable.update(n => [...(n || []), data]);

    layoutItemsWritable.update( n => ({
        ...n,
        add: [...n.add, [target, options]]
      })
    );
  }
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
  <div class="filename">
    <span>{metadata.filetype}</span>
    <span>{pageOffset} - {pageOffset + metadata.pageSize} ({(files || []).length})</span>
  </div>
  <ItemList
    buttonName="Search"
    titleKey="file.title"
    on:didClick={openFile}
    dataStore={derived(filesWritable, $a => $a.files)}
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

