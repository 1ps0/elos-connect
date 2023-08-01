
<script>
import { onMount } from 'svelte';

import * as actions from "./lib/actions.js";
import * as proxy from "./lib/apis/proxy.js";
import { cmds } from './lib/omnibox.js';

function generateItems(cmds, prefix = '') {
  const result = [];

  for (const key in cmds) {
    const cmd = cmds[key];
    const title = prefix + cmd.content;
    const click = () => cmd.action && cmd.action();
    result.push({ title, click });

    if (cmd.hasOwnProperty('children')) {
      result.push(...generateItems(cmd.children, title + '_'));
    }
  }

  return result;
}
let items = [
  {
    title: 'Reload eLOS',
    click: actions.reloadSystem,
  },
  {
    title: 'Set Dark mode 1',
    click: actions.applyDarkMode, // this is content-side via message passing
  },
  {
    title: 'Extract Text',
    click: actions.extractReaderText, // FIXME this is content-side via message passing
  },
  {
    title: 'Copy Selected Tabs',
    click: actions.selectedCopy,
  },
  {
    title: 'Download Video',
    click: actions.downloadVideo, 
  },
  ...generateItems(cmds)
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
