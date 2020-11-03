<script>
import { onMount } from 'svelte';
import {localForage} from "localForage";

import Dashboard from "./Dashboard.svelte";
import MainMenu from "./MainMenu.svelte";


onMount(async () => {
  console.log('App mounted');
});


</script>

<main>
  <header id="menu-item-dashboard">
    <Dashboard />
  </header>

  <MainMenu/>
</main>

<style>

body {
  margin: 0;
}

main {
  margin: 0 auto;
  font-size: 28px; /* Increased text to enable scrolling */
  padding: 0px 10px;
}

</style>