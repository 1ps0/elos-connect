
<script>

import { onMount } from 'svelte';

import { flip } from 'svelte/animate';
import { dndzone } from 'svelte-dnd-action';


const flipDurationMs = 300;
function handleDndConsider(e) {
  items = e.detail.items;
}
function handleDndFinalize(e) {
  items = e.detail.items;
}

</script>