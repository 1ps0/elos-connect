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

const gen_id = () => "_" + Math.random().toString(36).substr(2, 9);
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;

let fileset_selected;
let viewer_file;

let cols = 40;
let rowHeight = 100;
let adjustAfterRemove = false;

let itemTypes = {
  "menu-item-mainmenu": MainMenu,
  "menu-item-create": PkgCreate,
  "menu-item-metrics": DataGrid,
  "menu-item-open": Frame,
  "menu-item-notes": Editor,
  "menu-item-session": Session,
  "menu-item-pkgindex": PkgIndex,
  "menu-item-fileset": Fileset
};

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
  //   objects[item.target] = new itemTypes[item.target]({
  //     target: document.querySelector('#'+item.target),
  //     props: {
  //       items: items
  //     }
  //   });
  // });
}
function add(itemType, bindings) {
  let newItem = layoutGridHelp.item({
    w: 5,
    h: 6,
    x: 0,
    y: 0,
    id: gen_id(),
    bindings: bindings,
    target: itemType,
    name: itemType,
    // component: itemTypes[itemType]
  });

  if (itemType in objects){
    objects[itemType].$set({target: document.querySelector('#'+newItem.target) });
  }

  let findOutPosition = layoutGridHelp.findSpace(newItem, items, cols);
  console.log('adding ---',newItem, findOutPosition, objects[itemType]);
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

    if (item.target in objects) {
      console.log("found", item.target);
      return;
    }

    objects[item.target] = new itemTypes[item.target]({
      target: document.querySelector('#'+item.target),
      props: {
        items: items
      }
    });
    console.log("for item", item.target, document.querySelector('#'+item.target), objects[item.target]);

    if (item.bindings)
      objects[item.target].$on(item.bindings.event, item.bindings.callback);
  });
};

const reset = () => {
  // items = layoutGridHelp.normalize(items, cols);
  // items = layoutOriginal;
  // localStorage.setItem("layout", JSON.stringify(layoutOriginal));
};
onMount(async () => {
    console.log('App mounted');

    // for (let target in itemTypes)
    //   add(target);

    // "menu-item-create"
    // "menu-item-pkgindex"

    // add("menu-item-fileset", { callback: openFile, event: 'openFile'});
    // add("menu-item-open", null);
    add("menu-item-mainmenu", { callback: togglePanel, event: 'menuToggle'});
    add("menu-item-session", null);
    add("menu-item-metrics", null);

    add("menu-item-notes", null);
    // add("menu-item-");

    function serialize(val) {
      // items
      return JSON.stringify({...val, key: 'layout'});
    }
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("layout")) {
        var serial = serialize(items);
        localStorage.setItem(serial.key, serial);
      } else {
        layout = JSON.parse(localStorage.getItem(serialize));
      }
    }
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

}

function togglePanel(e) {
    let _layout = items.filter((value) => value.target === e.detail);
    console.log('toggled panel', e.detail, _layout);
    adjustAfterRemove = true;
    if (_layout.length > 0)
        remove(e.detail);
    else
        add(e.detail);
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
    font-size: 28px; /* Increased text to enable scrolling */
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