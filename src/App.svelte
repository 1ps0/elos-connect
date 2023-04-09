<script>
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import Grid from "svelte-grid";

  import { panelTypes, layoutConfig } from "./config/panels.js";
  import * as proxy from "./lib/apis/proxy.js";
  import { stores } from "./lib/stores.js"
  import { components } from "./components.js";
  import gridHelp from "svelte-grid/build/helper/index.mjs";
  import ActionButton from './ActionButton.svelte';
    import { getColumnFromBreakpoints } from './lib/layout_grid/other.js';

  const genId = () => "_" + Math.random().toString(36).substr(2, 9);

  let items = [];
  let objects = {};

  function hydrateParams(item) {
    if (!components.hasOwnProperty(item.componentName)) {
      console.log("MISSING COMPONENT", item.componentName);
    }

    if (item.props !== undefined
        && item.props.dataStore !== undefined
        && item.props.dataStore) {

      item.props.dataStore = stores[item.props.dataStore];

      if (item.target in objects && objects[item.target]) {
        objects[item.target].$set("dataStore", item.props.dataStore);
      }
    }

    if (item.event !== undefined) {
      switch(item.event.callback) {
        case "togglePanel": item.event.callback = togglePanel; break;
      }
      if (item && item.target && item.target in objects && objects[item.target] !== null) {
        objects[item.target].$on(item.event.name, item.event.callback);
      }
    }
    return item;
  }

  function _newItem(options={}) {
    return {
      [layoutConfig.columnCount]: hydrateParams(gridHelp.item({
        resizable: true,
        draggable: true,
        fixed: false,
        w: layoutConfig.columnCount,
        h: 7,
        id: genId(),
        ...options,
        x: 0,
        y: items.reduce((maxY, item) => Math.max(maxY, item.y + item.h), 0)
      }))
    };
  }

  function add(panelTarget, options={}) {
    options = {...panelTypes[panelTarget], ...options};
    let rootItem = _newItem(options);
    items = [...items, rootItem];
    return true;
  };

  const onAdd = (val) => {
    let item = val.detail;

    if (item && item.event && item.target in objects) {
      objects[item.target].$on(item.event.name, item.event.callback);
    }
  };

  const remove = (item) => {
    items = items.filter((value) => value.target !== item);
    if (items.length > 0) {
      delete objects[item];
    }
  };

  function togglePanel(e) {
    _togglePanel(e.detail.name);
  }

  function _togglePanel(itemName) {
    let _layout = items.filter((value) => value.target === itemName);
    if (_layout.length > 0)
      remove(itemName);
    else
      add(itemName);
  };

  onMount(async () => {
    proxy.print.success_App_mounted();

    let defaults = browser.runtime.getManifest().panels.default;
    let panels = Promise.resolve([]);
    (defaults || [
      "panel-mainmenu",
      "panel-web-players",
      // "panel-playlists",
      "panel-actionmenu",
      // "panel-config",
    ]).forEach((name) => {
      panels = panels.then((prev) => {
        return add(name)
      });
    });
    let result = await panels.catch(proxy.print.failure_panels);
    return result;
  });

</script>

<main class="h-screen bg-gray-800 text-gray-300">
  <header>
    <!-- <TopBar/> -->
  </header>

  <section class="relative h-full">
    <Grid
      bind:items={items}
      cols={[[layoutConfig.columnCount * layoutConfig.columnMultiplier, layoutConfig.columnCount]]}
      rowHeight={layoutConfig.rowHeight}
      gap={[layoutConfig.panelGap]}
      fillSpace=True
      let:item let:dataItem
    >
      <div
        class="bg-gray-700 rounded shadow p-2"
        data-x={item.x}
        data-y={item.y}
        data-w={item.w}
        data-h={item.h}
        data-id={item.id}
      >
        <div class="flex justify-between">
          <span class="font-semibold">
            {item.target.replace("panel-", '').replace('-', ' ')}
          </span>
          <!-- TODO: Add buttons for pin, shift up, shift down, close, max/shrink vertical -->
        </div>
        <hr class="my-2"/>
        <div class="flex space-x-2">
          <!-- Pin -->
          <ActionButton icon="pin" action={() => console.log("Pin action")} />
          <!-- Shift Up -->
          <ActionButton icon="arrow-up" action={() => console.log("Shift up action")} />
          <!-- Shift Down -->
          <ActionButton icon="arrow-down" action={() => console.log("Shift down action")} />
          <!-- Close -->
          <ActionButton icon="close" action={() => remove(item)} />
          <!-- Max/Shrink Vertical -->
          <ActionButton icon="maximize" action={() => console.log("Maximize/Shrink vertical action")} />
        </div>
        <svelte:component
          id={item.target}
          this={components[item.componentName]}
          bind:this={objects[item.target]}
          on:didMount={onAdd}
          data={item}
          {...item.props}
        />
      </div>
    </Grid>
  </section>
</main>
