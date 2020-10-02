<script>

import { onMount } from 'svelte';
const axios = require('axios');

function fetch__(uri) {
  axios.get("/api/search/topic/", { params: {} } )
    .then((response) => {
      console.log(response);
      data.status = response;
    })
    .catch((error) => {
      console.log("got error on fetch", error);
    });

}

onMount(async () => {

});


</script>

<style>

</style>

