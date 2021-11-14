<script>

/*
a selectable item with add entry at the top.
remote-oriented with source in/signal out

select to trigger an event
config panel to edit event
use entryform to edit event
so we need to reduce entry form fields necessary into an event
and send that event through config structure to the target component
*/

import { onMount, createEventDispatcher } from 'svelte';

import { icons } from "./lib/icons.js";
import { _fetch } from "./lib/apis.js";
import { stores } from "./lib/stores.js"

const dispatch = createEventDispatcher();

export let eventName = "menuToggle";
export let source = null;
export let transform = (e) => {
  return e.name.slice(10).toUpperCase()
};

export let data = {};
export let items = [];

const updateFromSource = async (source) => {
  if (source !== null) {
    let response = await _fetch({ uri: source});
    console.log('getting data from', source, response);
    items = response.data;
  }
};
$: source !== null ? updateFromSource(source) : null;


let visibleItems = [];
$: visibleItems = items.map((item, idx) => {
  // expects item: { name: "", value: x }
  return {
    ...item,
    active: visibleItems.length > idx ? visibleItems[idx].active : false
  };
});

function toggleActive(item) {
  item.active = !item.active;
}

function sendEvent(e) {}

function _sendEvent(item) {
  console.log('clicked sendEvent --', eventName, item);
  if (eventName === "filterType") {
    // stores.files.update((n) => ({
    //   ...n,
    //   filetype: item.name,
    //   dirty: true
    // }));
  } else {
    // let _data = { ...data, target: e.target.name};
    // console.log("dispatching", eventName, _data);
    dispatch(eventName, item);
  }
  toggleActive(item);
}

onMount(async () => {
  console.log('SelectList mounted', data);

  updateFromSource(source);
  dispatch("didMount", data);
});


</script>

<section>

  <ul class="pill-nav">
    {#each visibleItems as item, index (item.name) }
      <li
        {index}
        {item}
        class:active={item.active}
        on:click|stopPropagation|preventDefault={() => _sendEvent(item) }
        title={item.value.highlight}
      >
        {#if item.value.icon}
          <svelte:component this={icons[item.value.icon]}/>
        {:else}
          {transform(item)}
        {/if}
      </li>
    {:else}
      <li>No Data</li>
    {/each}
  </ul>
</section>

<style>

ul {
  list-style:none;
  list-style-type:none;
  padding:0px;
  margin:0px;
}

/* Style the links inside the pill navigation menu */
.pill-nav li {
  background-repeat:no-repeat;
  background-position:0px 5px;
  display: block;
  color: black;
  text-align: center;
  padding: 14px;
  text-decoration: none;
  /*font-size: 17px;*/
  border-radius: 5px;
  float: left;
}

/* Change the color of links on mouse-over */
.pill-nav li:hover {
  background-color: #ddd;
  color: black;
}

/* Add a color to the active/current link */
.pill-nav li.active {
  background-color: dodgerblue;
  color: white;
}

/*
  Menu Tabs
  https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_search_menu
*/

section {
  font-family: Arial, Helvetica, sans-serif;
}

</style>