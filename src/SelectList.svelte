<script>
import { onMount, createEventDispatcher, getContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

const axios = require('axios');
const dispatch = createEventDispatcher();
const filetypeContext = getContext("filetypes");

export let eventName = "menuToggle";
export let source;
export let transform = (e) => { return e.name.slice(10).toUpperCase() };

export let item = {};
export let items = [];

$: {
  if (source) {
    getData(source, (response) => {
      console.log('getting data from', source, response);
      items = response.data.data;
    });
  }
};

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
  // console.log('clicked sendEvent --', eventName, e.target, e);
  toggleActive(e);
  if (eventName === "filterType") {
    filetypeContext.update((_) => e.target.name);
  } else {
    dispatch(eventName, e.target);
  }
}

const getData = (uri, callback) => {
  axios.get(uri)
    .then(callback)
    .catch((error) => {
      console.log("got error on fetch", error);
    });
}

onMount(async () => {
  console.log('SelectList mounted', item);
  // console.log('selectlist', items, eventName, visibleItems);

  dispatch("didMount", item);
});


// <MarkdownEditor />
</script>

<section>

  <div class="pill-nav">
    {#each visibleItems as item}
      <a
        name={item.name}
        href="#{item.name}"
        on:click|preventDefault={sendEvent}
        class:active={item.active}
      >
        {transform(item)}
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