<script>

import { onMount } from 'svelte';

// import Entry from "./Entry.svelte";
import Fileset from "./Fileset.svelte";

$: data = {
  status: {},
  entry: {},
  tagsets: []
};

async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  cb(await ret.json());
};

onMount(async () => {

  // await fetch_('/api/counts', (ret) => data.status = ret);
  // await fetch_('/api/filetype/pdf?page_size=20&page_num=1', (ret) => data.files = ret);
  // await fetch_('/api/example/1', (ret) => data.entry = ret);
  // await fetch_('/api/tagsets', (ret) => data.tagsets = ret);
  // await fetch_('/api/file/'+filehash);

  console.log('mounted');
});

</script>

<main>


  <div>
    <Fileset />
  </div>


</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 1000px;
    margin: 0 auto;
  }

  h2,h3,p {
    text-align: center;
  }

  div {
    border: 5px;
  }

</style>