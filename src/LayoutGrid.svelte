
<script>
  import { onMount, onDestroy } from 'svelte';
  import { setContext } from 'svelte';

  // Helper functions from helper.js
  function adjust(items, col) {
    return items.map((item) => {
      item.x = Math.min(col - item.w, item.x);
      item.y = Math.min(col - item.h, item.y);
      return item;
    });
  }

  // Resize listener functions
  function addResizeListener(element, callback) {
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(callback);
      observer.observe(element);
      return observer;
    } else {
      window.addEventListener('resize', callback);
      return null;
    }
  }

  function removeResizeListener(element, observer) {
    if (observer) {
      observer.disconnect();
    } else {
      window.removeEventListener('resize', callback);
    }
  }

  export let cols = 12;
  export let gap = 1;
  export let rowHeight = 30;
  export let items = [];

  let container;
  let width;

  onMount(() => {
    const resizeListener = () => {
      width = container.clientWidth;
      items = adjust(items, cols);
    };
    const observer = addResizeListener(container, resizeListener);
    onDestroy(() => removeResizeListener(container, observer));
  });

  function itemStyle(item) {
    const w = (width / cols) * item.w - gap;
    const h = rowHeight * item.h - gap;
    const x = (width / cols) * item.x;
    const y = rowHeight * item.y;

    return `width: ${w}px; height: ${h}px; transform: translate(${x}px, ${y}px);`;
  }

  setContext('layout-grid', { cols, gap, rowHeight });
</script>

<div class="relative" bind:this={container}>
  {#each items as item, index (item.id)}
    <div
      class="absolute bg-gray-200 rounded shadow"
      style={itemStyle(item)}
      tabindex="0"
    >
      <slot {item} {index}></slot>
    </div>
  {/each}
</div>

<style>
  .layout-grid {
    position: relative;
  }

  .layout-grid .item {
    position: absolute;
    background-color: #f8f8f8;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
</style>
