<script>

import { onMount } from 'svelte';

// { "filetype": "pdf", "files": [], 'page_num': 1, 'page_size': 20}
export let filetype = 'pdf';
export let files = [];
export let page_num = 1;
export let page_size = 20;

async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  cb(await ret.json());
};

async function fetch_filelist(page, filetype) {
  await fetch_('/api/filetype/'+filetype+'?page_size='+page_size+'&page_num='+page, (ret) => {
    console.log(ret);
    filetype = ret.filetype;
    files = ret.files;
    page_num = ret.page_num;
    page_size = ret.page_size;
  });
}

async function fetch_filenames(hash) {
    const ret = await fetch('/api/file/'+hash);
    return await ret.json();
}

onMount(() => {
  fetch_filelist(1, 'pdf');
});

</script>

<a id="navigation-button" title="Next" href="#" on:click={() => fetch_filelist(page_num+1, filetype)}>Next Page</a>

<div>
    <p class="filename">{filetype}<span class="status"> {files.page_size * files.page_num} - {files.page_size * (files.page_num + 1)} ({files.length})</span></p>
    <br/>

    <table>
        <tr>
            <th>Filenames</th>
            <th>Topics</th>
            <th>Neighbor Titles</th>
            <th>Neighbor Keywords</th>
            <!--
            <th>File Ext</th>
            <th>File Mime</th>
            <th>File Size</th>
            <th>Metadata Version</th>
            <th>Metadata Format</th>
            <th>Metadata CreatedAt</th>
            <th>blake2b hash</th>
            -->
        </tr>
    {#each files as file}
      <tr>
        {#await fetch_filenames(file["hash.blake2b"])}
        <td>
            <span class="status">loading...</span>
        </td>
        <td>
            <span class="status">-</span>
        </td>
        <td>
            <span class="status">-</span>
        </td>
        <td>
            <span class="status">-</span>
        </td>
        {:then data}
        <td>
            <ul>
            {#each data.locations as entry}
                <li class="filename">{entry}</li>
            {/each}
            </ul>
        </td>
        <td>
            <ul>
            {#each data.tags as tag}
                <li class="status">
                    {tag}
                </li>
            {/each}
            </ul>
        </td>
        <td>
            <ul>
            {#each data.neighbors as neigh}
                <li class="filename">{neigh[0]}</li>
            {/each}
            </ul>
        </td>
        <td>
            <ul>
            {#each data.neighbors as neigh}
                <li class="status">{neigh[1]}</li>
            {/each}
            </ul>
        </td>
        {/await}
        <!--
        <td>{file["file.ext"]}</td>
        <td>{file["file.mime"]}</td>
        <td>{file["file.size"]}</td>
        <td>{file["metadata.version"]}</td>
        <td>{file["metadata.format"]}</td>
        <td>{file["metadata.created_at"]}</td>
        <td>{file["hash.blake2b"]}</td>
        -->
      </tr>
    {/each}
    <ul>
</div>

<style>

  p {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
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

  @media screen and (prefers-reduced-motion: no-preference) {
    html,
    body {
      scroll-behavior: smooth;
    }
  }

  .back-to-top-link {
    display: inline-block;
    text-decoration: none;
    font-size: 2rem;
    line-height: 3rem;
    text-align: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: #D6E3F0;
    padding: 0.25rem;
  }
</style>

