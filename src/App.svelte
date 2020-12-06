<script>
import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import LayoutGrid from "./LayoutGrid.svelte";
import layoutGridHelp from "./lib/layout_grid/helper.js";
// import { layoutItem } from "./lib/layout_item.js"

import Dashboard from "./Dashboard.svelte";

import ListQueue from "./ListQueue.svelte";
import SelectList from "./SelectList.svelte";
import Editor from "./Editor.svelte";
import Files from "./Files.svelte";
import Session from "./Session.svelte";
import Frame from "./Frame.svelte";
import DataGrid from "./DataGrid.svelte";
import EntryForm from "./EntryForm.svelte";

import PkgIndex from "./PkgIndex.svelte";
import PkgCreate from "./PkgCreate.svelte";

let items = [];
let objects = {};

let selectedFile = "", selectedFileData = null;
$: selectedFileData = `/api/load?filepath=${selectedFile}`;

const gen_id = () => "_" + Math.random().toString(36).substr(2, 9);
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
const serializeLayout = (val) => { return JSON.stringify({...val, key: 'layout'}) };

let cols = 40;
let rowHeight = 100;
let adjustAfterRemove = false;

let mul = 3;
let types = [{name: "menu-item-metrics", value: false},{name: "menu-item-files", value: false},{name: "menu-item-filetypes", value: false},{name: "menu-item-frame", value: false},{name: "menu-item-editor", value: false},{name: "menu-item-create", value: false},{name: "menu-item-pkgindex", value: false},{name: "menu-item-session", value: false},{name: "menu-item-entryform", value: false}];

/*
Item Interface:
menu_item: true,
bind: { name, callback },
event: { name, callback },
props: { prop1: value1, ...},
name: eg label, display name
target: eg id, target value for types
*/

let panelFiletypes = {
  visible: true,
  target: "menu-item-filetypes",
  name: "filetypes",
  w: mul*3,
  component: SelectList,
  event: { name: 'filterType', callback: (e) => {
    console.log("updating for filetype", e.detail.name);
    objects["menu-item-filetypes"].selectedExtension = e.detail.name;
  } },
  props: {
    eventName: "filterType",
    source: "/api/file/types",
    transform: (e) => { return `${e.name} (${e.value})` }
  }
};

let panelTypes = {
  "menu-item-mainmenu": {
    visible: true,
    target: "menu-item-mainmenu",
    name: "mainmenu",
    w: mul*3,
    component: SelectList,
    event: { name: 'menuToggle', callback: togglePanel },
    // bind: { name: '' },
    props: {
      eventName: "menuToggle",
      items: types
    }
  },
  "menu-item-files": {
    visible: true,
    target: "menu-item-files",
    name: "files",
    w: mul*5,
    component: Files,
    event: { name: 'openFile', callback: openFile },
    dependents: [ panelFiletypes]
  },
  // "menu-item-filetypes": panelFiletypes,
  "menu-item-panelhistory": {
    visible: true,
    target: "menu-item-panelhistory",
    name: "history",
    w: mul*3,
    component: ListQueue
  },
  "menu-item-metrics": {
    visible: true,
    target: "menu-item-metrics",
    name: "metrics",
    w: mul*4,
    component: DataGrid,
  },
  "menu-item-frame": {
    visible: false,
    target: "menu-item-frame",
    name: "frame",
    w: mul*5,
    component: Frame,
  },
  "menu-item-editor": {
    visible: true,
    target: "menu-item-editor",
    name: "editor",
    w: mul*5,
    component: Editor,
  },
  "menu-item-session": {
    visible: true,
    target: "menu-item-session",
    name: "session",
    w: mul*3,
    component: Session,
  },
  "menu-item-entryform": {
    visible: true,
    target: "menu-item-entryform",
    name: "entryform",
    w: mul*5,
    component: EntryForm,
  },
  "menu-item-pkgindex": {
    visible: false,
    target: "menu-item-pkgindex",
    name: "pkgindex",
    w: mul*8,
    component: PkgIndex,
  },
  "menu-item-create": {
    visible: false,
    target: "menu-item-create",
    name: "create",
    w: mul*5,
    component: PkgCreate,
  },
};

let dashboardConfig = {

};
let workspaceConfig = {

};
const dashboardContext = setContext("dashboard", writable(dashboardConfig));
const workspaceContext = setContext("workspace", writable(workspaceConfig));


function _newItem(options={}) {
  return layoutGridHelp.item({
    h: 6,
    id: gen_id(),
    ...options,
  });
}

function positionItem(item) {
  let findOutPosition = layoutGridHelp.findSpace(item, items, cols);
  return { ...item, ...findOutPosition };
}

function add(panelTarget, options={}) {
  options = {...panelTypes[panelTarget], ...options};
  let rootItem = _newItem(options);
  items = [...items, positionItem(rootItem)];

  for (let x = 0; x < (options.dependents || []).length; x++) {
    let newItem = _newItem(options.dependents[x]);
    items = [...items, positionItem(newItem)];
  }

  // console.log('adding ---', panelTarget, options, items);
};

const onAdd = (val) => {
  // console.log("did onAdd", val);
  let item = val.detail;
  if (item.props) {
    objects[item.id].$set(item.props);
  }

  if (item.event) {
    objects[item.id].$on(item.event.name, item.event.callback);
  }
};

const remove = (item) => {
  // FIXME move object to stasis BEFORE deleting it
  items = items.filter((value) => value.target !== item);
  if (adjustAfterRemove) {
    delete objects[item];
    items = layoutGridHelp.adjust(items, cols);
  }
  console.log('removing ---',item, items);
};


onMount(async () => {
  console.log('App mounted');

  add("menu-item-mainmenu");
});

function searchFilter(e) {
  console.log("submitted!", e);
  // Declare variables
  var input, filter, ul, li, a, i;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  ul = document.getElementById("menu");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function togglePanel(e) {
  let itemName = e.detail.name;
  _togglePanel(itemName);
}

function _togglePanel(itemName) {
  let _layout = items.filter((value) => value.target === itemName);
  console.log('toggled panel', itemName, _layout);
  adjustAfterRemove = true;
  if (_layout.length > 0)
    remove(itemName);
  else
    add(itemName);
};

function openFile(e) {
  console.log('open file', e);
  let data = e.detail.data;
  let target = null;

  if (data.name === "md") {
    target = "menu-item-editor";
  }
  else if (data.name === "pdf") {
    target = "menu-item-frame";
  }
  else if (["jpg", "gif", "png"].indexOf(data.name) != -1) {
    target = "menu-item-gallery";
  }
  // else if (data.name === "") {

  // }
  // else if (data.name === "") {

  // }

  if (target !== null) {
    historyWritable.update(n => n + [data]);
    add(target, {
      target_name: target,
      props: {
        selectedFileData
      }
    });
  }
}

// move this to .js?
const registeredActions = writable({});
registeredActions.subscribe((val) => {
  console.log("update for registeredActions", val);
  // TODO add to history queue

});
registeredActions.update((n) => {
  n.toggle = (itemName) => { _togglePanel(itemName); };
  return n;
});
setContext("registeredActions", registeredActions);

const filetypeContext = setContext("filetypes", writable("md")); // TODO replace md with state load

const historyWritable = writable([]);
historyWritable.subscribe((val) => {
  console.log("update for historyWritable", val);
  // TODO add to history queue

});
setContext("eventHistory", historyWritable);

</script>

<main>
  <header id="menu-item-dashboard">
    <Dashboard/>
  </header>

  <section>

    <LayoutGrid
      cols={cols}
      gap={10}
      rowHeight={rowHeight}
      bind:items={items}
      let:item
      let:index
    >

    <!-- <div id={item.target} class="tablecontent"></div> -->
    <svelte:component
      id={item.target}
      this={item.component}
      props={item.props}
      bind:this={objects[item.id]}
      on:didMount={onAdd}
      {item}
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