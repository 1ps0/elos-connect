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

import { rowHeight, panelGap, columnCount } from "./config/layout.js";
import { icons } from "./lib/icons.js";
import { components } from "./components.js";
import { panelTypes, optionTypes } from "./config/panels.js";
console.log("PANEL TYPES", panelTypes);

import { _fetch, updateFiletype, } from "./lib/apis.js";
import { stores, layoutItemsWritable } from "./lib/stores.js"

import LayoutGrid from "./LayoutGrid.svelte";
import layoutGridHelp from "./lib/layout_grid/helper.js";

const genId = () => "_" + Math.random().toString(36).substr(2, 9);
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
const serializeLayout = (val) => { return JSON.stringify({...val, key: 'layout'}) };



let items = [];
let objects = {};
$: items;
$: console.log("ITEMS", items);

let layoutItems = layoutItemsWritable;
layoutItems.subscribe(val => {
  items = val.items;
  for (let pendingItem in val.add) {
    add(pendingItem[0], pendingItem[1]);
  }
  // layoutItems.update( n => ({...n.items, add: []} ));
});

let adjustAfterRemove = false;

let persistent = {
  cache: {},
  profile: {},
  targets: {},
  state: { data: items }
};

function hydrateParams(item) {

  if (!components.hasOwnProperty(item.componentName)) {
    console.log("MISSING COMPONENT", item.componentName);
  }

  if (item.props !== undefined
      && item.props.panelOpts === undefined) {
    item.props.panelOpts = Object.assign({}, optionTypes);
    for (let opt in item.props.panelOpts) {
      let val = item.props.panelOpts[opt];
      switch(val.title) {
        case 'close': val.onClick = () => { remove(item) }; break;
        case 'pin': val.onClick = () => {}; break;
      }
    }
  }

  // hydrate datastores
  if (item.props !== undefined
      && item.props.dataStore !== undefined
      && item.props.dataStore) {

    item.props.dataStore = stores[item.props.dataStore];

    if (item.target in objects) {
      objects[item.target].$set("dataStore", item.props.dataStore);
    }
  }

  // hydrate events
  if (item.event !== undefined
      && item.event.callback !== undefined) {

    switch(item.event.callback) {
      case "updateFiletype": item.event.callback = updateFiletype; break;
      case "togglePanel": item.event.callback = togglePanel; break;
      // case "openFile": item.event.callback = openFile; break;
    }
    if (item && item.target && item.target in objects) {
      objects[item.target].$on(item.event.name, item.event.callback);
    }
  }
  return item;
}

const positionItem = (item) => {
  let findOutPosition = layoutGridHelp.findSpace(item, items, columnCount);
  // console.log("UPDATED POSITION", item, findOutPosition, items);
  return { ...item, ...findOutPosition };
};

function _newItem(options={}) {
  return positionItem(
    layoutGridHelp.item({
      h: 7,
      id: genId(),
      ...hydrateParams(options),
    })
  );
}

function add(panelTarget, options={}) {
  // TODO render icons into menuItems
  // TODO render source/dataStore props into actual stores
  // TODO ...? i changed a lot
  if (!panelTypes.hasOwnProperty(panelTarget)) {
    console.log("MISSING PANEL", panelTarget);
  }

  options = {...panelTypes[panelTarget], ...options};
  let rootItem = _newItem(options);
  items = [...items, rootItem];
  console.log('ADDING', panelTarget, rootItem);

  for (let dep in (options.dependents || [])) {
    let newItem = _newItem({
      ...panelTypes[dep],
      border: "red",
      parent: rootItem
    });
    // console.log("ADDING DEPENDENT", newItem);
    items = [...items, newItem];
  }
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
  if (adjustAfterRemove) {
    // items = layoutGridHelp.adjust(items, columnCount);
    delete objects[item];
    // adjustAfterRemove =
  }
  console.log('removing ---',item, items);
};

function togglePanel(e) {
  console.log("TOGGLE PANEL", e);
  let item = e.detail;
  _togglePanel(item.name);
}

function _togglePanel(itemName) {
  let _layout = items.filter((value) => value.target === itemName);
  adjustAfterRemove = true;
  console.log("_TOGGEL PANEL", itemName, _layout);
  if (_layout.length > 0)
    remove(itemName);
  else
    add(itemName);
};


onMount(async () => {
  console.log('App mounted');

  // registeredActions.update((n) => {
  //   n.gallery = (itemName) => {};
  //   n.video = (itemName) => {};
  //   n.audio = (itemName) => {};
  //   n.toggle = (itemName) => { _togglePanel(itemName) };
  // });

  add("panel-mainmenu");
  add("panel-commandbar");
  // _togglePanel("panel-gallery");
  // _togglePanel("panel-files");
  // _togglePanel("panel-session");
  // _togglePanel("panel-dashboard");


});

</script>

<main>

  <section>
    <LayoutGrid
      cols={columnCount}
      gap={panelGap}
      rowHeight={rowHeight}
      bind:items={items}
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
      {#if item.props && item.props.panelOpts}
        <svelte:component
          id={item.id}
          this={components.options}
          bind:target={objects[item.target]}
          {item}
        />
      {/if}
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