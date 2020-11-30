<script>
import { onMount } from 'svelte';

import LayoutGrid from "./LayoutGrid.svelte";
import layoutGridHelp from "./lib/layout_grid/helper.js";
// import { layoutItem } from "./lib/layout_item.js"

import Dashboard from "./Dashboard.svelte";

import SelectList from "./SelectList.svelte";
import Editor from "./Editor.svelte";
import Fileset from "./Fileset.svelte";
import Session from "./Session.svelte";
import Frame from "./Frame.svelte";
import DataGrid from "./DataGrid.svelte";
import EntryForm from "./EntryForm.svelte";

// import PkgIndex from "./PkgIndex.svelte";
// import PkgCreate from "./PkgCreate.svelte";

const gen_id = () => "_" + Math.random().toString(36).substr(2, 9);
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
const serializeLayout = (val) => { return JSON.stringify({...val, key: 'layout'}) };

let cols = 40;
let rowHeight = 100;
let adjustAfterRemove = false;

let mul = 3;
let types = ["menu-item-metrics","menu-item-fileset","menu-item-filetypes","menu-item-frame","menu-item-editor","menu-item-session","menu-item-entryform"];
// "menu-item-create","menu-item-pkgindex",

/*
Item Interface:
menu_item: true,
bind: { name, callback },
event: { name, callback },
props: { prop1: value1, ...},
name: eg label, display name
target: eg id, target value for types
*/
let itemTypes = {
  "menu-item-mainmenu": {
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
  "menu-item-fileset": {
  target: "menu-item-fileset",
  name: "fileset",
  w: mul*8,
  component: Fileset,
  event: { name: 'openFile', callback: openFile }
  },
  "menu-item-filetypes": {
  target: "menu-item-filetypes",
  name: "filetypes",
  w: mul*3,
  component: SelectList,
  event: { name: 'filterType', callback: togglePanel },
  props: { eventName: "filterType" }
  },
  "menu-item-metrics": {
  target: "menu-item-metrics",
  name: "metrics",
  w: mul*4,
  component: DataGrid,
  },
  "menu-item-frame": {
  target: "menu-item-frame",
  name: "frame",
  w: mul*5,
  component: Frame,
  },
  "menu-item-editor": {
  target: "menu-item-editor",
  name: "editor",
  w: mul*3,
  component: Editor,
  },
  "menu-item-session": {
  target: "menu-item-session",
  name: "session",
  w: mul*3,
  component: Session,
  },
  "menu-item-entryform": {
  target: "menu-item-entryform",
  name: "entryform",
  w: mul*5,
  component: EntryForm,
  // event: { },
  // props:
  },
  // "menu-item-pkgindex": {
  //   target: "menu-item-pkgindex",
  //   name: "pkgindex",
  //   w: mul*8,
  //   component: PkgIndex,
  // },
  // "menu-item-create": {
  //   target: "menu-item-create",
  //   name: "create",
  //   w: mul*5,
//   component: PkgCreate,
  // },
};

let visibleItems = ['menu-item-mainmenu'];//, 'menu-item-metrics', 'menu-item-session', 'menu-item-editor'];

let items = [];
let objects = {};
$: console.log('updating items', items);

let selectedFile = "", selectedFileData = null;
$: selectedFileData = `/api/load?filepath=${selectedFile}`;

function openFile(e) {
  console.log('open file', e);
  let data = e.detail.data;
  let target = null;

  if (data["file.ext"] === "md") {
    target = "menu-item-editor";
  }
  else if (data["file.ext"] === "pdf") {
    target = "menu-item-frame";
  }

  if (target != null) {
    add(target, {
      ...itemTypes[target],
      target_name: target,
      props: {
        selectedFileData
      }
    });
  }
}

function add(itemType, options={}) {
  let newItem = layoutGridHelp.item({
  h: 6,
  id: gen_id(),
  ...options,
  });
  if (itemType in objects){
  // objects[itemType].$set({target: document.querySelector('#'+itemType) });
  }

  let findOutPosition = layoutGridHelp.findSpace(newItem, items, cols);
  console.log('adding ---', itemType, options, newItem);
  items = [...items, ...[{ ...newItem, ...findOutPosition }]];
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

const onChange = () => {
  // localStorage.setItem("layout", JSON.stringify(items));
  items.map((item) => {
    if (document.querySelector('#'+item.target) === null) {
      console.log("target doesnt exist yet", item.target);
      return;
    }
    console.log(objects, items);
    if (item.target in objects) {
      console.log("found", item.target);
      return;
    }

    objects[item.target] = new itemTypes[item.target].component({
      target: document.querySelector('#'+item.target),
      props: item.props
    });
    console.log("for item", item.target, item.props, document.querySelector('#'+item.target), objects[item.target]);

    if (item.event) {
      console.log('item event', item);
      objects[item.target].$on(item.event.name, item.event.callback);
    }
  });

  // var serial = serializeLayout(items);
  // localStorage.setItem(serial.key, serial);
};

const reset = () => {
  // items = layoutGridHelp.normalize(items, cols);
  // items = layoutOriginal;
  // localStorage.setItem("layout", JSON.stringify(layoutOriginal));
};
onMount(async () => {
  console.log('App mounted');

  for (let item in visibleItems) {
    let itemName = visibleItems[item];
    add(itemName, itemTypes[itemName]);
  }

  // if (typeof window !== "undefined") {
  //   if (!localStorage.getItem("layout")) {
  //     var serial = serializeLayout(items);
  //     localStorage.setItem(serial.key, serial);
  //   } else {
  //     items = JSON.parse(localStorage.getItem(serial));
  //   }
  // }
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
  let itemName = e.detail;

  let _layout = items.filter((value) => value.target === itemName);
  console.log('toggled panel', e, _layout);
  adjustAfterRemove = true;
  if (_layout.length > 0)
    remove(itemName);
  else
    add(itemName, itemTypes[itemName]);
};

</script>

<main>
  <header id="menu-item-dashboard">
    <Dashboard />
  </header>

  <section>
    <input type="text" id="search" on:submit|preventDefault={searchFilter} placeholder="...">

    <LayoutGrid
    cols={cols}
    gap={10}
    rowHeight={rowHeight}
    on:change={onChange}
    bind:items={items}
    let:item
    let:index>

    <div id={item.target} class="tablecontent"></div>
    <!-- <svelte:component
      id={item.target}
      this={item.component}
      props={item.props}
      bind:this={objects[item.target]}
    /> -->
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

 /* Style the search box */
#search {
  width: 100%;
  font-size: 18px;
  padding: 11px;
  border: 1px solid #ddd;
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