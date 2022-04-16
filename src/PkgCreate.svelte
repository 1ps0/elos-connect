<script>

import Wizard from "./Wizard.svelte";
import Files from "./Files.svelte";
import ItemList from "./ItemList.svelte";

import { onMount } from 'svelte';

let selected_files;
$: selected_files;

onMount(() => {
  print.success_PkgCreate_mounted();
});

</script>

<div class="main">
    <Wizard />
</div>

<style>
</style>
