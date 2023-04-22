<script>
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import LayoutGrid from "./LayoutGrid.svelte";
  import layoutGridHelp from "./lib/layout_grid/helper.js";

  import { panelTypes, layoutConfig } from "./config/panels.js";
  import * as proxy from "./lib/apis/proxy.js";
  import { stores } from "./lib/stores.js"
  import { components } from "./components.js";
  import ActionButton from './ActionButton.svelte';

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

  function positionItem(item) {
    return Promise.resolve(item)
      .then(_item => ({
        ..._item,
        ...layoutGridHelp.findSpace(_item, items, layoutConfig.columnCount)
      }))
      .catch(proxy.print.failure_panels_position_item)
  }
  function _newItem(options={}) {
    return Promise.resolve(options)
      .then(_opts => ({
        ...hydrateParams(_opts),
        w: layoutConfig.columnCount,
        h: 7, // FIXME add default height
        id: genId(),
      }))
      .then(proxy.print.status_panels_new_item)
      .then(layoutGridHelp.makeItem)
      .then(positionItem)
      .catch(proxy.print.failure_panels_new_item)
  }

function add(panelTarget, options={}) {
  // TODO render icons into menuItems
  // TODO render source/dataStore props into actual stores
  if (!panelTypes.hasOwnProperty(panelTarget)) {
    // console.log("MISSING PANEL", panelTarget);
  }
  Promise.resolve(panelTarget)
    .then(_target => panelTypes[_target])
    .then(_type => ({..._type, ...options}))
    .then(_newItem)
    .then(_item => [...items, _item])
    .then(_items => items = _items)
    .catch(proxy.print.failure_panels_add_item)
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
      panels = panels
        .then((prev) => add(name))
        .catch(proxy.print.failure_panel);
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
    <LayoutGrid
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
    </LayoutGrid>
  </section>
</main>
