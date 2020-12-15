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
import ImageGallery from "./ImageGallery.svelte";

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

let icons = ["๛", "ຜ", "ᚙ", "ᚖ", "ᛞ", "ᛝ", "ᛥ", "ᜊ", "ᝎ", "ᝪ", "៙", "៩", "៨", "៧", "៦", "៥", "៤", "៣", "២", "១", "០", "ᬉ", "ᬊ", "☰", "ⵚ", "ⵛ", "〠", "ꇪ"];

let mul = 3;
let types = [
  {name: "menu-item-metrics", value: { icon: "๛", highlight: "Metrics"}},
  {name: "menu-item-files", value: { icon: "☷", highlight: "File List"}},
  {name: "menu-item-filetypes", value: { icon: "ⵚ", highlight: "Filetype List (with counts)"}},
  {name: "menu-item-frame", value: { icon: "ᛞ", highlight: "iFrame for PDF"}},
  {name: "menu-item-editor", value: { icon: "ᚖ", highlight: "Code or MD Editor"}},
  {name: "menu-item-create", value: { icon: "ᚙ", highlight: "Package Creation Wizard"}},
  {name: "menu-item-pkgindex", value: { icon: "៙", highlight: "Package List"}},
  {name: "menu-item-session", value: { icon: "ᛥ", highlight: "New Session/Workspace"}},
  {name: "menu-item-entryform", value: { icon: "ᜊ", highlight: "Add Data"}},
  {name: "menu-item-eventhistory", value: { icon: "ᝎ", highlight: "Event History"}},
];


const fetchFromLocalStorage = (item) => {
    return JSON.parse(localStorage.getItem(item));
};

const saveToLocalStorage = (item, value) => {
    localStorage.setItem(item, JSON.stringify(value));
};


let dashboardConfig = {};
let dashboardWritable = writable(dashboardConfig);
dashboardWritable.subscribe((val) => {
  console.log("[App] dashboardWritable update", val);
  localStorage.setItem('dashboard', JSON.stringify(val));
});

let workspaceConfig = {};
let workspaceWritable = writable(workspaceConfig);
workspaceWritable.subscribe((val) => {
  console.log("[App] workspaceWritable update", val);
  localStorage.setItem('workspace', JSON.stringify(val));
  //JSON.parse(localStorage.getItem(item));
});

const dashboardContext = setContext("dashboard", dashboardWritable);
const workspaceContext = setContext("workspace", workspaceWritable);


let persistent = {
  cache: {},
  profile: {},
  state: { data: items }
};


// need a 'view' window of current open stuff to maintain the place
// of the user within each data set
// a kind of cursor which is different or can be synced across
// different data types and representations, eg pdf viewed vs file list vs image gallery

// can we chain readable/writable?
// so readable(value) internally updates
// then writable calls readable's values for those datasets

// move this to .js?
const registeredActions = writable({});
registeredActions.subscribe((val) => {
  console.log("update for registeredActions", val);
  // TODO add to history queue

});
registeredActions.update((n) => {
  n.toggle = (itemName) => { _togglePanel(itemName); };
  n.gallery = (itemName) => {};
  n.fetch = async (url, params) => {
    // TODO replace base url with env var or other
    let baseUrl = "http://localhost:8080";
    let _url = new URL(url, baseUrl);
    for (let arg in params) {
      _url.searchParams.append(arg, params[arg]);
    }
    let result = await fetch(_url);
    return result.json();
  };

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
    let obj = objects["menu-item-files"];
    if (obj) obj.metadata.filetype = e.detail.name;
  } },
  props: {
    eventName: "filterType",
    source: "/api/file/types",
    transform: (e) => { return `${e.name} (${e.value})` }
  }
};

let panelEventHistory = {
  visible: false,
  target: "menu-item-eventhistory",
  name: "eventhistory",
  w: mul*2,
  component: ListQueue,
  props: {
    readonly: true,
    dataStore: historyWritable
  }
};

let panelTypes = {
  "menu-item-dashboard": {
    visible: true,
    target: "main-item-dashboard",
    name: "dashboard",
    w: cols,
    h: 1,
    component: Dashboard
  },
  "menu-item-mainmenu": {
    visible: true,
    target: "menu-item-mainmenu",
    name: "mainmenu",
    w: mul*1,
    component: SelectList,
    event: { name: 'menuToggle', callback: togglePanel },
    // bind: { name: '' },
    props: {
      eventName: "menuToggle",
      items: types,
      transform: (e) => { return e.value.icon }
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
  "menu-item-filetypes": panelFiletypes,
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
    w: mul*5,
    component: Session,
    dependents: [ panelEventHistory]
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
  "menu-item-eventhistory": panelEventHistory,
};

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

  console.log('adding ---', panelTarget, options, items);
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

  // let workspace = JSON.parse(localStorage.getItem('workspace'));
  // let dashboard = JSON.parse(localStorage.getItem('dashboard'));

  // workspaceWritable = writable(workspace);
  // dashboardWritable = writable(dashboard);

  // add("menu-item-dashboard");
  add("menu-item-mainmenu");
  add("menu-item-session");

  // filetypeContext.subscribe( (val) => {
  //   console.log("sub:fileset:filetypes", val);
  //   if (["jpg", "gif", "png"].indexOf(data.name) != -1) {
  //     add("menu-item-gallery", {props: { images: val}});
  //   }
  // });

});

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
    historyWritable.update(n => [...n, data]);
    add(target, {
      target_name: target,
      props: {
        selectedFileData
      }
    });
  }
}
</script>

<main>
  <!-- <header id="menu-item-dashboard">
    <Dashboard/>
  </header> -->

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
      bind:this={objects[item.id]}
      on:didMount={onAdd}
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