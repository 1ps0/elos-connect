<script>
  import { onMount } from 'svelte';
  import { cmds } from './cmds.js';

  let items = [];

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

  onMount(() => {
    items = generateItems(cmds);
  });
</script>

<style>
  /* Add any desired styles for the controls */
</style>

<section>
  {#each items as item (item.title)}
    <p><button on:click={item.click}>{item.title}</button></p>
  {/each}
</section>
