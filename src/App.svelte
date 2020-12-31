<script>
import { onMount } from 'svelte';

import { components } from "./components.js";
import { rowHeight, panelGap, columnCount } from "./config/layout.js";
import { panelTypes } from "./config/panels.js";
console.log("PANEL TYPES", panelTypes);

import { icons } from "./lib/icons.js";
import { _fetch, selectedFile, selectedFilePath, updateFiletype } from "./lib/apis.js";
import { historyWritable, filesWritable, registeredActions } from "./lib/stores.js"

import LayoutGrid from "./LayoutGrid.svelte";
import layoutGridHelp from "./lib/layout_grid/helper.js";

const genId = () => "_" + Math.random().toString(36).substr(2, 9);
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
const serializeLayout = (val) => { return JSON.stringify({...val, key: 'layout'}) };


let items = [];
let objects = {};
$: items;
$: console.log("ITEMS", items);

let adjustAfterRemove = false;

let persistent = {
  cache: {},
  profile: {},
  targets: {},
  state: { data: items }
};

function hydrateParams(item) {
  if (item.props !== undefined && item.props.dataStore !== undefined) {
    switch(item.props.dataStore) {
      case "filesWritable": item.props.dataStore = filesWritable; break;
      case "historyWritable": item.props.dataStore = historyWritable; break;
      case "workspaceWritable": item.props.dataStore = workspaceWritable; break;
    }
  }
  if (item.event !== undefined && item.event.callback !== undefined) {
    switch(item.event.callback) {
      case "updateFiletype": item.event.callback = updateFiletype; break;
      case "togglePanel": item.event.callback = togglePanel; break;
      case "openFile": item.event.callback = openFile; break;
    }
  }
  return item;
}

function _newItem(options={}) {
  return layoutGridHelp.item({
    h: 7,
    id: genId(),
    ...hydrateParams(options),
  });
}

function positionItem(item) {
  let findOutPosition = layoutGridHelp.findSpace(item, items, columnCount);
  console.log("UPDATED POSITION", item, findOutPosition, items);
  return { ...item, ...findOutPosition };
}

function add(panelTarget, options={}) {
  // TODO render icons into menuItems
  // TODO render source/dataStore props into actual stores
  // TODO ...? i changed a lot
  options = {...panelTypes[panelTarget], ...options};
  let rootItem = positionItem(_newItem(options));
  items = [...items, rootItem];
  console.log('ADDING', panelTarget, rootItem);

  for (let x = 0; x < (options.dependents || []).length; x++) {
    let dependent = panelTypes[options.dependents[x]];
    let newItem = _newItem(dependent);
    newItem = positionItem({
      ...newItem,
      border: "red",
      parent: rootItem
    });
    console.log("ADDING DEPENDENT", newItem);
    items = [...items, newItem];
  }
};

const onAdd = (val) => {
  console.log("did onAdd", val);
  let item = val.detail;

  if (item.event) {
    objects[item.id].$on(item.event.name, item.event.callback);
  }
};

const remove = (item) => {
  // FIXME move object to stasis BEFORE deleting it
  items = items.filter((value) => value.target !== item);
  if (adjustAfterRemove) {
    delete objects[item];
    items = layoutGridHelp.adjust(items, columnCount);
  }
  console.log('removing ---',item, items);
};

function togglePanel(e) {
  console.log("TOGGLE PANEL", e);
  let itemName = e.detail.target.name;
  // console.log('toggled panel', e);
  _togglePanel(itemName);
}

function _togglePanel(itemName) {
  let _layout = items.filter((value) => value.target === itemName);
  console.log('_toggled panel', itemName, _layout);
  adjustAfterRemove = true;
  if (_layout.length > 0)
    remove(itemName);
  else
    add(itemName);
};

function openFile(e) {
  console.log('open file', e);
  let data = e.detail.data;
  let target;

  if (["md", "txt", "json"].indexOf(data.name) != -1) {
    target = "panel-editor";
  }
  else if (data.name === "pdf") {
    target = "panel-pdf";
  }
  else if (["jpg", "gif", "png"].indexOf(data.name) != -1) {
    target = "panel-gallery";
  }

  if (target !== undefined) {
    let options = {
      target_name: target,
      props: {
        data: selectedFilePath
      }
    };
    console.log("data for open file", options);

    historyWritable.update(n => [...n, data]);

    add(target, options);
  }
}

onMount(async () => {
  console.log('App mounted');

  registeredActions.update((n) => {
    n.gallery = (itemName) => {};
    n.video = (itemName) => {};
    n.audio = (itemName) => {};
    n.toggle = (itemName) => { _togglePanel(itemName) };
  });

  add("panel-mainmenu");
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
        bind:this={objects[item.id]}
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