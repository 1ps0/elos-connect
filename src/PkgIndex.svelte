<script>

import { onMount } from 'svelte';
import PkgEntry from "./PkgEntry.svelte";

export let pkgs = [];

$: pkgs;

async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  let ret_json = await ret.json();
  console.log('[]',ret_json);
  cb(ret_json);
};

async function fetch_pkg_index() {
  let loc = `/api/pkg`;

  await fetch_(loc, (ret) => {
    pkgs = ret;
  });
}

onMount(() => {
  print.success_PkgIndex_mounted();
  fetch_pkg_index();
});

</script>

<div>
  <hr/>
  <h3>Package Index</h3>
  <table id="container-pkgs">
  {#each pkgs as pkg}
    <tr>
      <PkgEntry pkg={pkg} />
    </tr>
  {/each}
  <ul>
</div>

<style>

</style>

