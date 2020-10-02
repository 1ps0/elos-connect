<script>

import { onMount } from 'svelte';
import Entry from "./Entry.svelte";

// { "filetype": "pdf", "files": [], 'page_num': 1, 'page_size': 20}
export let filetype = 'pdf';
export let files = [];
export let page_num = 1;
export let page_size = 5;
export let page_offset = (page_num - 1) * page_size;
export let keywords = 'learning';
export let viewer_file;

$: viewer_file;
$: keywords;
$: files;

async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  cb(await ret.json());
};

async function fetch_filelist(page, filetype, keywords='') {
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

onMount(() => {
  fetch_filelist(1, 'pdf', keywords);
});

</script>

<div>
  <hr/>
  <h3>File Index</h3>
  <table>
    <tr>
      <td>
        <p class="filename">{filetype}
          <span class="status">
          {page_offset} - {page_offset + page_size} ({files.length})
          </span>
        </p>
        <a class="next-button" title="Next" href="#" on:click={() => fetch_filelist(page_num+1, filetype, keywords)}>
          Next Page
        </a>
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
  {#each files as file}
    <tr>
      <Entry file={file} bind:viewer_file={viewer_file}/>
    </tr>
  {:else}
  lol
  {/each}
  <ul>
</div>

<style>

._data {
  display: flex;
  justify-content: center;
}

p {
  color: #ff3e00;
  text-transform: uppercase;
  font-size: 4em;
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

</style>

