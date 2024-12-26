<script>
  import { onMount, createEventDispatcher } from "svelte";
  import MoveResize from "./LayoutGridMoveResize.svelte";
  
  export let panelItems;
  export let rowHeight;
  export let cols;
  export let gap = 10;
  export let breakpoints = [];
  export let dynamicCols = true;

  let container;
  let xPerPx = 0;
  let yPerPx = rowHeight;
  let containerWidth;
  let getComputedCols;

  // Calculate container height based on panel positions
  $: containerHeight = layout.getContainerHeight(panelItems, yPerPx);

  // Recalculate column width when container size changes
  $: if (containerWidth && cols) {
    xPerPx = (containerWidth - (gap * (cols - 1))) / cols;
  }

  // Update panel positions when container size changes
  const onResize = layout.debounce(() => {
    if (panelItems && panelItems.length) {
      // Redistribute panels horizontally first
      panelItems = layout.redistributePanels(panelItems, getComputedCols);
    }
  }, 100);

  onMount(() => {
    const sizeObserver = new ResizeObserver(async (entries) => {
      let width = entries[0].contentRect.width;
      
      if (width === containerWidth) return;
      
      containerWidth = width;
      getComputedCols = await layout.getColumnFromBreakpoints(breakpoints, width, cols);
      
      xPerPx = (width - (gap * (getComputedCols - 1))) / getComputedCols;
      
      onResize();
    });

    sizeObserver.observe(container);
    return () => sizeObserver.disconnect();
  });
</script>

<div class="svlt-grid-container" style="height: {containerHeight}px" bind:this={container}>
  {#each (panelItems || []) as item, i (item.id)}
    <MoveResize
      on:load={handleRepaint}
      on:repaint={handleRepaint}
      id={item.id}
      resizable={item.resizable}
      draggable={item.draggable}
      {xPerPx}
      {yPerPx}
      width={Math.min(getComputedCols, item.w) * xPerPx - gap}
      height={item.h * yPerPx - gap}
      top={item.y * yPerPx + gap}
      left={item.x * xPerPx + gap}
      {gap}
      {item}
      min={item.min}
      max={item.max}
      cols={getComputedCols}>
      <slot {item} index={i}/>
    </MoveResize>
  {/each}
</div>