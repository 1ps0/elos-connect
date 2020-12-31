<script>
import { onMount, createEventDispatcher, getContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { icons } from "./lib/icons.js";
import { _fetch } from "./lib/apis.js";
import { filesWritable } from "./lib/stores.js"

const dispatch = createEventDispatcher();

export let eventName = "menuToggle";
export let source = null;
export let transform = (e) => {
  return e.name.slice(10).toUpperCase()
};

export let data = {};
export let items = [];

const updateSource = async (source) => {
  let response = await _fetch(source);
  console.log('getting data from', source, response);
  items = response.data;
};
$: source !== null ? updateSource(source) : null;


let visibleItems = [];
$: visibleItems = items.map((item, idx) => {
  // expects item: { name: "", value: x }
  return {
    ...item,
    active: visibleItems.length > idx ? visibleItems[idx].active : false
  };
});


// $: console.log('menu items', items, eventName, visibleItems);

function toggleActive(e) {
  let item = visibleItems.filter((value) => value.name === e.originalTarget.name);
  if (item.length > 0)
    item = item[0];

  // console.log("toggleactive", visibleItems, e, item);
  item.active = !item.active;
}

function sendEvent(e) {
  console.log('clicked sendEvent --', eventName, e.target, e);
  toggleActive(e);
  if (eventName === "filterType") {
    filesWritable.update((n) => ({
      ...n,
      filetype: e.target.name,
      dirty: true
    }));
  } else {
    dispatch(eventName, e);
  }
}

onMount(async () => {
  console.log('SelectList mounted', data);
  // console.log('selectlist', items, eventName, visibleItems);

  dispatch("didMount", data);
});


// <MarkdownEditor />
</script>

<section>

  <div
    class="pill-nav"
    on:click|capture|preventDefault={sendEvent}
  >
    {#each visibleItems as item, index}
      <a
        {index}
        name={item.name}
        href="#{item.name}"
        class:active={item.active}
      >
        {#if item.value.icon}
          <svelte:component this={icons[item.value.icon]}/>
        {:else}
          {transform(item)}
        {/if}
      </a>
    {/each}
  </div>
</section>

<style>
/* Style the links inside the pill navigation menu */
.pill-nav a {
  display: block;
  color: black;
  text-align: center;
  padding: 14px;
  text-decoration: none;
  /*font-size: 17px;*/
  border-radius: 5px;
}

/* Change the color of links on mouse-over */
.pill-nav a:hover {
  background-color: #ddd;
  color: black;
}

/* Add a color to the active/current link */
.pill-nav a.active {
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