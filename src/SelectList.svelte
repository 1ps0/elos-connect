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
import * as network from "./lib/apis/network.js";
import * as proxy from "./lib/apis/proxy.js";

const dispatch = createEventDispatcher();

export let eventName = "menuToggle";
export let source = null;

export let transform = (e) => {
  return Promise.resolve(e)
    .then(_e => _e.name)
    .then(_name => _name.slice(30))
    .then(toUpperCase)
    .catch(proxy.print.failure_transform)
};

export let data = {};
export let items = [];

const updateFromSource = (source) => {
  Promise.resolve(source)
  .then(_source => { uri: source})
  .then(network._fetch)
  .then(_response => items = _response.data)
  .catch(proxy.print.failure_update_from_source)
};
// $: source !== null ? updateFromSource(source) : null;


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
  // console.log('clicked sendEvent --', eventName, item);
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
  proxy.print.success_SelectList_mounted();

  if (source) {
    updateFromSource(source);
  }
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
          <svelte:component this={icons[item.value.icon]} size={16} class="icon"/>
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

  .pill-nav {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    max-height: 200px; /* Adjust this value according to your needs */
  }

  /* Style the links inside the pill navigation menu */
  .pill-nav li {
    background-repeat:no-repeat;
    background-position:0px 5px;
    border:1px solid transparent;
    color:#666;
    float:left;
    font-size:12px;
    height:24px;
    line-height:24px;
    margin-right:8px;
    padding-left:5px;
    padding-right:5px;
    text-align:center;
    text-decoration:none;
    transition:all 200ms ease-in-out;
  }

  .pill-nav li.active {
    border:1px solid #000;
    color:#fff;
  }

  .pill-nav li:hover {
    color:#fff;
  }

  .pill-nav li:first-child {
    margin-left:0px;
  }

  /* SelectList styles */
  .pill-nav li {
    border: 1px solid #965A38;
    color: #5D5C5C;
  }

  .pill-nav li.active {
    background-color: #965A38;
    color: #F7F5EF;
  }

  .pill-nav li:hover {
    background-color: #F7F5EF;
    color: #965A38;
  }
</style>
