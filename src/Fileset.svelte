<script>

import { onMount } from 'svelte';

// { "filetype": "pdf", "files": [], 'page_num': 1, 'page_size': 20}
export let filetype = 'pdf';
export let files = [];
export let page_num = 1;
export let page_size = 10;
export let page_offset = (page_num - 1) * page_size;
export let keywords = 'learning';
export let viewer_file;
export let selected_files = [];

// $: console.log('-> selected: ',selected_files)

export let item = {
  h: 4,
  w: 8,
  target: "menu-item-fileset",
  name: "Fileset"
}

$: selected_files;
$: viewer_file;
$: keywords;
$: files;

async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  cb(await ret.json());
};

async function fetch_filelist(page, filetype, keywords='learning') {
  let loc = `/api/filetype/${filetype}?page_size=${page_size}&page_num=${page}`;
  if (keywords.length > 0) {
    loc = `${loc}&keywords=${keywords}`;
  }
  await fetch_(loc, (ret) => {
    console.log(ret);
    filetype = ret.filetype;
    files = ret.files;
    page_num = ret.page_num;
    page_size = ret.page_size;
    page_offset = ret.page_offset;
    keywords = ret.keywords || '';
  });
}

async function fetch_filenames(hash) {
  const ret = await fetch('/api/file/'+hash);
  return await ret.json();
}

function add_to_package(e, file) {
  console.log('add_to_package', e);
  e.target.parentElement.parentElement.parentElement.hidden = true;

  selected_files.push(file)
  selected_files = selected_files;
}

onMount(() => {
  console.log('Fileset mounted');
  fetch_filelist(1, 'pdf', keywords);
});

</script>

<div>
  <table>
    <tr>
      <td>
        <div class="filename">{filetype}
          {page_offset} - {page_offset + page_size} ({files.length})
        </div>
        <button class="next-button" on:click|preventDefault={() => fetch_filelist(page_num+1, filetype, keywords)}>
          Next Page
        </button>
        <form on:submit={
          (e) => {
              e.preventDefault();
              console.log(e);
              page_num = 1;
              fetch_filelist(page_num, filetype, keywords);
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
    </tr>
  </table>
  <table id="container-files">
    <tr>
      <th class="select-file"></th>
      <th class="file-name">name</th>
      <th class="file-mime">mime | ext</th>
      <th class="file-open">open</th>
      <th class="file-options">options</th>
    </tr>
  {#each files as file}
    <tr>
      <td class="select-file">
        <input type="checkbox" value={file}/>
      </td>
      <td class="file-name">{file['file.title']}</td>
      <td class="file-mime">{file['file.mime']} | {file['file.ext']}</td>
      <td class="file-open">
        <button on:click|preventDefault={() => (viewer_file = file.locations[0])}>open</button>
      </td>
      <td class="file-options">
        <div>
          <button on:click|preventDefault="{(e) => add_to_package(e, file)}">add to package</button>
        </div>
      </td>
    </tr>
  {/each}
  <ul>
</div>

<style>

.file-name {
  width:55%;
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

