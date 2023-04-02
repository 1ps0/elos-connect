<script>
  export let icon = null;
  export let action = () => {};

  import { icons } from "./lib/icons.js";
</script>

<button on:click|stopPropagation|preventDefault="{action}" class="action-button">
  {#if icon && icons[icon]}
    <svelte:component this="{icons[icon]}" />
  {/if}
</button>

<style>
  .action-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    color: inherit;
  }
</style>
