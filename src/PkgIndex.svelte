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
  console.log("PkgIndex mounted");
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

.data {
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

