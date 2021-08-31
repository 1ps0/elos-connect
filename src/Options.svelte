<script>

import { createEventDispatcher, onMount } from 'svelte';
import { icons } from "./lib/icons.js";
import { _layoutAction } from "./lib/layoutAction.js";

const dispatch = createEventDispatcher();

export let config = {};
// export let inputs = writable({});
// export let data = await _fetch(config.url, config.params);
// export let transforms = item.transform;
// export let displayPanel = item.component;
// export let feedbackHooks = item.events;

// export let item = null;
// export let target = null;


onMount(async () => {
  console.log('Options mounted');
});

</script>

<div id="nav" class="sidenav">
  {#each Object.entries(config) as opt (opt[0])}
    <a href="#" class="tag">
      <div use:_layoutAction={opt}>
        {#if opt.icon}
          <svelte:component this={icons[opt.icon]} />
        {:else}
          {opt.title}
        {/if}
      </div>
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
