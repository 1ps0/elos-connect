<script>
import { onMount } from 'svelte';
import {localForage} from "localForage";

import LayoutGrid from "./LayoutGrid.svelte";
import layoutGridHelp from "./lib/layout_grid/helper.js";

import Dashboard from "./Dashboard.svelte";

import MainMenu from "./MainMenu.svelte";
import Editor from "./Editor.svelte";
import PkgIndex from "./PkgIndex.svelte";
import PkgCreate from "./PkgCreate.svelte";
import Fileset from "./Fileset.svelte";
import Session from "./Session.svelte";
import Frame from "./Frame.svelte";
import DataGrid from "./DataGrid.svelte";
import EntryForm from "./EntryForm.svelte";

const gen_id = () => "_" + Math.random().toString(36).substr(2, 9);
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
const serializeLayout = (val) => { return JSON.stringify({...val, key: 'layout'}) };

let fileset_selected;
let viewer_file;

let cols = 40;
let rowHeight = 100;
let adjustAfterRemove = false;

let mul = 3;
let types = ["menu-item-create","menu-item-metrics","menu-item-open","menu-item-notes","menu-item-session","menu-item-pkgindex","menu-item-fileset", "menu-item-entryform"];

let itemTypes = {
  "menu-item-mainmenu": {
    w: mul*3,
    component: MainMenu,
    events: { name: 'menuToggle', callback: togglePanel },
    bind: { name: '' },
    props: types
  },
  "menu-item-create": {
    w: mul*5,
    component: PkgCreate,
  },
  "menu-item-metrics": {
    w: mul*4,
    component: DataGrid,
  },
  "menu-item-open": {
    w: mul*5,
    component: Frame,
  },
  "menu-item-notes": {
    w: mul*3,
    component: Editor,
  },
  "menu-item-session": {
    w: mul*3,
    component: Session,
  },
  "menu-item-pkgindex": {
    w: mul*8,
    component: PkgIndex,
  },
  "menu-item-fileset": {
    w: mul*8,
    component: Fileset,
    events: { name: 'openFile', callback: openFile }
  },
  "menu-item-entryform": {
    w: mul*5,
    component: EntryForm,
    events: { },
    // props:
  },
};

let visibleItems = ['menu-item-mainmenu'];//, 'menu-item-metrics', 'menu-item-session', 'menu-item-notes'];

let items = [];
let objects = {};
$: {
  console.log('updating items', items.length);
  // items.map((item) => {
  //   if (document.querySelector('#'+item.target) === null) {
  //     console.log("target doesnt exist yet", item.target);
  //     return;
  //   }

  //   if (item.target in objects) {
  //     console.log("found", item.target);
  //     return;
  //   }

  //   console.log("for item", item.target, document.querySelector('#'+item.target));
  //   objects[item.target] = new itemTypes[item.target].component({
  //     target: document.querySelector('#'+item.target),
  //     props: {
  //       items: items
  //     }
  //   });
  // });
}
function add(itemType, options={}) {
  let newItem = layoutGridHelp.item({
    w: Math.floor(cols / visibleItems.length),
    h: 6,
    x: 0,
    y: 0,
    id: gen_id(),
    target: itemType,
    name: itemType.slice(10).toUpperCase(),
    ...options,
  });
  if (itemType in objects){
    objects[itemType].$set({target: document.querySelector('#'+itemType) });
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
      props: {
        items: item.props
      }
    });
    console.log("for item", item.target, item.props, document.querySelector('#'+item.target), objects[item.target]);

    if (item.events) {
      console.log('item events', item);
      objects[item.target].$on(item.events.name, item.events.callback);
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

function openFile(e) {
    console.log('open file', e);

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

    <!--
        <button on:click={add}>Add (random size)</button>
        <button on:click={addAt}>Add random (x=0,y=0)</button>
     -->
        <LayoutGrid
        cols={cols}
        gap={10}
        rowHeight={rowHeight}
        on:change={onChange}
        bind:items={items}
        let:item
        let:index>

          <div id={item.target} class="tablecontent"></div>
        </LayoutGrid>
    </section>

<div id="waiting-room" style="display:none;">
  {#each itemTypes as item (target)}
    <p>{target} -> {item}</p>
  {/each}
</div>

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