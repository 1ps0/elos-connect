<script>

import Wizard from "./Wizard.svelte";
import Files from "./Files.svelte";
import Editor from "./Editor.svelte";
import ListQueue from "./ListQueue.svelte";

import { onMount } from 'svelte';

let selected_files;
$: selected_files;

onMount(() => {
  console.log('PkgCreate mounted');
});

</script>

<div class="main">
    <Wizard >
        <!-- <Editor bind:fileset_selected={selected_files} /> -->
    </Wizard>
</div>

<style>
</style>
