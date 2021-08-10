<script>

import { createEventDispatcher, onMount } from 'svelte';
import { icons } from "./lib/icons.js";

const dispatch = createEventDispatcher();

export let item = null;
export let target = null;

export let panelOpts = [];
$: panelOpts = item ? item.props.panelOpts : panelOpts;
// $: debug ? console.log("OPTIONS", panelOpts) : null;

onMount(async () => {
  console.log('Options mounted');
});

</script>

<div id="nav" class="sidenav">
  {#each panelOpts as opt}
    <a href="#" class="tag">
      {console.log("OPT", opt, _)}
      {#if opt.icon}
        <svelte:component this={icons[opt.icon]} />
      {:else}
        {opt.title}
      {/if}
    </a>
  {/each}
</div>

<style>

#nav a {
  position: absolute;
  /*left: -80px;*/
  transition: 0.3s;
  padding: 5px;
  width: 20px;
  text-decoration: none;
  font-size: 14px;
  color: white;
  border-radius: 0 5px 5px 0;
}

#nav a:hover {
  left: 0;
}

.tag {
  top: 20px;
  background-color: #4CAF50;
}

</style>
