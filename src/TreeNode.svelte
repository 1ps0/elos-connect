<script>
export let item;
export let items;

let children = [];

$: children = items.filter(x => x.parent === item.id);

function toggleOpen() {
  item.open = !item.open;
}

</script>

<li>
  <span on:click={toggleOpen}>{item.name}</span>
  {#if item.open}
    <ul>
      {#each children as child}
        <svelte:component this={TreeNode} item={child} items={items} />
      {/each}
    </ul>
  {/if}
</li>
<style>
  body {
    background-color: #F7F5EF;
    color: #5D5C5C;
  }

  a {
    color: #965A38;
  }

  h1, h2, h3, h4, h5, h6 {
    color: #965A38;
  }

  .button {
    background-color: #965A38;
    color: #F7F5EF;
  }

  .button:hover {
    background-color: #F7F5EF;
    color: #965A38;
  }
</style>
