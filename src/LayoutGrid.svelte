<style>
  .svlt-grid-container {
    position: relative;
  }
</style>

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
      width={Math.min(getComputedCols, item.w) * xPerPx - gap * 2}
      height={item.h * yPerPx - gap * 2}
      top={item.y * yPerPx + gap}
      left={item.x * xPerPx + gap}
      {gap}
      {item}
      min={item.min}
      max={item.max}
      {dynamic}
      cols={getComputedCols}>
      <slot {item} index={i}/>
    </MoveResize>
  {/each}
</div> 

<script>
  import * as layout from "./lib/apis/layout.js";
  import * as proxy from "./lib/apis/proxy.js";
  import { onMount, createEventDispatcher } from "svelte";
  import MoveResize from "./LayoutGridMoveResize.svelte";

  export let panelItems;
  export let rowHeight;
  export let cols;
  export let gap = 10;
  export let breakpoints = [];
  export let dynamicCols = true;

  export let debounceUpdate = 100;
  export let debounceResize = 100;
  export let dynamic = false;

  const dispatch = createEventDispatcher();
  $: console.log("[panelItems][LayoutGrid]", panelItems);

  let getComputedCols;

  let container;

  let xPerPx = 0;
  let yPerPx = rowHeight;

  let containerWidth;

  $: containerHeight = layout.getContainerHeight(panelItems, yPerPx);

  let prevCols;

  $: {
    if (prevCols !== cols && dynamicCols) {
      xPerPx = containerWidth / cols;
    }
    prevCols = cols;
  }

  const onResize = layout.debounce(() => {
    if (breakpoints.length) {
      panelItems(panelItems, getComputedCols);
    }

    dispatch("resize", {
      cols: getComputedCols,
      xPerPx,
      yPerPx,
      width: containerWidth,
    });
  }, debounceResize);


  onMount(() => {
    const sizeObserver = new ResizeObserver(async (entries) => {
      let width = entries[0].contentRect.width;

      if (width === containerWidth) return;

      getComputedCols = await layout.getColumnFromBreakpoints(breakpoints, width, cols);

      xPerPx = width / getComputedCols;

      if (!containerWidth) {
        if (breakpoints.length) {
          panelItems(panelItems, getComputedCols);
        }

        dispatch("mount", {
          cols: getComputedCols,
          xPerPx,
          yPerPx, // same as rowHeight
        });
      } else {
        onResize();
      }

      containerWidth = width;
    });

    sizeObserver.observe(container);

    return () => sizeObserver.disconnect();
  });


  const updateMatrix = ({ detail }) => {
    return Promise.resolve(detail)
      .then(_detail => layout.getItemById(_detail.id, panelItems)
        .then(item => ({_detail, item})))
      .then(({_detail, item}) => {
        return Promise.resolve(item)
          .then(_item => Object.assign(item, _detail.shadow))
          .then(_item => layout.moveItem(_item, panelItems, getComputedCols, _detail.clone))
          .then(proxy.print.status_update_matrix_1)
          .then(_panelItems => {
            panelItems = _panelItems;
            if (_detail.onUpdate) {
              _detail.onUpdate();
            }

            dispatch("change", {
              unsafeItem: item,
              id: item.id,
            });
          })
      })
      .catch(proxy.print.failure_layout_grid_update_matrix)
  };

  export const handleRepaint = layout.debounce(updateMatrix, debounceUpdate);
</script>
