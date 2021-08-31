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

import { icons } from "./lib/icons.js";
import { components } from "./components.js";
import { panelTypes, optionTypes, layoutConfig } from "./config/panels.js";
console.log("PANEL TYPES", panelTypes);

import { _fetch, updateFiletype, openFile } from "./lib/apis.js";
import { stores } from "./lib/stores.js"

import LayoutGrid from "./LayoutGrid.svelte";
import { _layoutAction } from "./lib/layoutAction.js";
import layoutGridHelp from "./lib/layout_grid/helper.js";
import layoutItem from "./lib/layout_grid/item.js";

const genId = () => "_" + Math.random().toString(36).substr(2, 9);
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
const serializeLayout = (val) => { return JSON.stringify({...val, key: 'layout'}) };


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
      case "updateFiletype": item.event.callback = updateFiletype; break;
      case "togglePanel": item.event.callback = togglePanel; break;
      case "openFile": item.event.callback = openFile; break;
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
    console.log("MISSING PANEL", panelTarget);
  }

  options = {...panelTypes[panelTarget], ...options};
  let rootItem = _newItem(options);
  items = [...items, rootItem];
  console.log('ADDING', panelTarget, rootItem);

  return true;
};


const onAdd = (val) => {
  console.log("did onAdd", val);
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

  add("panel-mainmenu");
  // add("panel-locations");
  // add("panel-commandbar");
});

//bind:items={items}
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
      <svelte:component
        id={item.target}
        this={components[item.componentName]}
        bind:this={objects[item.target]}
        on:didMount={onAdd}
        data={item}
        {...item.props}
        {index}
      />
    </LayoutGrid>
  </section>

</main>

<style>

body {
  margin: 0;
}

main {
  margin: 0 auto;
  font-size: 18px; /* Increased text to enable scrolling */
  padding: 0px 10px;
}

section > div {
  display: block;
  position: absolute;
  overflow: auto;
  top: 50%;
  left: 50%;
  min-height: 100%;
  min-width: 100%;
  transform: translate(-50%, -50%);
}


/* Style the tab content */
.tabcontent {
  float: left;
  padding: 0px 12px;
  border: none;
  width: 70vw;
  height: 90vw;
}
</style>