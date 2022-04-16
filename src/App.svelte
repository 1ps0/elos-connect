<script>
/*
TODO - desktop
- set background color/image/video/panel
- smiley face when no panels open
- hover over smiley face shows "close" button below it
- right-click capture needs to have an option to show browser right-click menu (probably via capture-event suppression)

TODO - layout
- panels with pin/close buttons, probably a desktop bar
- panel with options to arrange panels
- panel with native os functions, like open finder, run command, etc.
- join panels, split panels
- toolbar can be glommed on to all sides of a component frame

*/

import { onMount } from 'svelte';

import { components } from "./components.js";
import { panelTypes, layoutConfig } from "./config/panels.js";
console.log("PANEL TYPES", panelTypes);

import { print } from "./lib/apis.js";
import { stores } from "./lib/stores.js"

import LayoutGrid from "./LayoutGrid.svelte";
import layoutGridHelp from "./lib/layout_grid/helper.js";

const genId = () => "_" + Math.random().toString(36).substr(2, 9);

let items = [];
let objects = {};
$: items;
// $: console.log("ITEMS", items);

function hydrateParams(item) {
  if (!components.hasOwnProperty(item.componentName)) {
    console.log("MISSING COMPONENT", item.componentName);
  }

  // hydrate datastores
  if (item.props !== undefined
      && item.props.dataStore !== undefined
      && item.props.dataStore) {

    item.props.dataStore = stores[item.props.dataStore];

    if (item.target in objects && objects[item.target]) {
      objects[item.target].$set("dataStore", item.props.dataStore);
    }
  }

  // hydrate events
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
  return {
    ...item,
    ...layoutGridHelp.findSpace(item, items, layoutConfig.columnCount)
  };
}

function _newItem(options={}) {
  return positionItem(
    layoutGridHelp.item({
      w: layoutConfig.columnCount,
      h: 7, // FIXME add default height
      id: genId(),
      ...hydrateParams(options),
    })
  );
}

function add(panelTarget, options={}) {
  // TODO render icons into menuItems
  // TODO render source/dataStore props into actual stores
  if (!panelTypes.hasOwnProperty(panelTarget)) {
    // console.log("MISSING PANEL", panelTarget);
  }

  options = {...panelTypes[panelTarget], ...options};
  let rootItem = _newItem(options);
  items = [...items, rootItem];
  // console.log('ADDING', panelTarget, rootItem);

  return true;
};


const onAdd = (val) => {
  // console.log("did onAdd", val);
  let item = val.detail;

  if (item && item.event && item.target in objects) {
    objects[item.target].$on(item.event.name, item.event.callback);
  }
};

const remove = (item) => {
  // FIXME move object to stasis BEFORE deleting it
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
  console.log('App mounted');

  let defaults = browser.runtime.getManifest().panels.default;
  let panels = Promise.resolve([]);
  (defaults || [
    "panel-mainmenu",
    "panel-focus",
    "panel-playlists",
    "panel-web-players",
    "panel-actionmenu",
    // "panel-dashboard",
    // "panel-timer",
    // "panel-commandbar",
    // "panel-location-ops",
    // "panel-locations",
  ]).forEach((name) => {
    panels = panels.then((prev) => {
      // console.log("[PANEL][ADD]", name, '--', prev);
      return add(name)
    });
  });
  let result = await panels.catch(print.failure_panels);
  // console.log("FINISHED PANEL ADD", result);
  return result;
});
// .then(print.success_app)
// .catch(print.failure);

</script>

<main>

  <section>
    <LayoutGrid
      cols={layoutConfig.columnCount}
      gap={layoutConfig.panelGap}
      rowHeight={layoutConfig.rowHeight}
      bind:items
      let:item
      let:index
    >
      <div>
        <span>
          {item.target.replace("panel-", '').replace('-', ' ')}
          <!-- TODO: buttons
            1. pin
            2. shift up
            3. shift down
            4. close
            5. max/shrink vertical
            6.
          -->
          <hr/>
        </span>
        <svelte:component
          id={item.target}
          this={components[item.componentName]}
          bind:this={objects[item.target]}
          on:didMount={onAdd}
          data={item}
          {...item.props}
          {index}
        />
      </div>
    </LayoutGrid>
  </section>

</main>

<style>

main {
  margin: 0 0 0 0;
  /*background-color: blue;*/
  font-size: 16px; /* Increased text to enable scrolling */
  padding: 0px 2px;
}

section > div {
  display: block;
  /*position: absolute;*/
  overflow: auto;
  /*top: 50%;
  left: 50%;*/
  min-height: 100%;
  min-width: 100%;
  transform: translate(-50%, -50%);
}

</style>