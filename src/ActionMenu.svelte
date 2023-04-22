<script>
import { onMount } from 'svelte';

import * as actions from "./lib/actions.js";
import * as proxy from "./lib/apis/proxy.js";

let items = [
  {
    title: 'Reload eLOS',
    click: actions.reloadSystem,
  },
  {
    title: 'Set Dark mode 1',
    click: actions.applyDarkMode,,
  },
  {
    title: 'Extract Text',
    click: actions.extractReaderText,,
  },
  {
    title: 'Copy Selected Tabs',
    click: actions.selectedCopy,
  },
  {
    title: 'Download Video',
    click: actions.downloadVideo,
  },
]
onMount(async () => {
  proxy.print.success_ActionMenu_mounted();
});
</script>


<section>
  {#each items as item (item.title)}
    <p><button on:click={item.click}>{item.title}</button></p>
  {/each}
</section>
