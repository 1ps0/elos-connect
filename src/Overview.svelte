<script>

import { onMount } from 'svelte';
const axios = require('axios');

$: overview = {};

async function runOverview() {

  axios.get("/api/counts", { params: {} } )
    .then((response) => {
      console.log(response.data);
      overview = response.data;
    })
    .catch((error) => {
      console.log("got error on fetch", error);
    });
}

onMount(async () => {
    // await runOverview();
});

</script>


<table class="_data">
    <tr>
    {#each overview as datapoint}
        <th>{Object.keys(datapoint)}</th>
    {/each}
    </tr>
    <tr>
    {#each overview as datapoint}
        <td>{Object.values(datapoint)}</td>
    {/each}
    <tr>

    </tr>
</table>

<style>

._data {
    display: grid;
    justify-content: center;
}

td,th {
    /*border-width: 0px;*/
    padding: 20 20 20 20;
}

._overview {
    display: grid;
    /*text-align: center;*/
    flex-direction: row;
    justify-content: center;
    /*flex: 0 50%;*/
    /*box-sizing: border-box;*/
}
</style>
