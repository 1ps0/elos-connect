<script>
/*
TODO -
1. action buttons
2. badges
3. dynamic customization (via in-page editor)
4. sortable
5. quick add
6. mass select/actions
7. filterable
*/

import { createEventDispatcher, onMount } from 'svelte';
import { writable, get } from 'svelte/store';
import { linker } from "./lib/linker.js";
import { _fetch } from "./lib/apis.js";

const dispatch = createEventDispatcher();

export let dataSourcePath = null;
export let dataStore = null;
export let dataKey = null;
export let readonly = false;
export let transform = (x) => x;
export let buttons = [];

let dataSource = null;
let queue = [];
$: console.log('queue -->', queue, dataStore);

// TODO make this part of the toolbar
// TODO make 'add' trigger a writable

export let buttonName = "Add";
export let inputEvent = null;
export let titleKey = null;
export let stashStack = [];
$: readonly = !buttonName || !inputEvent;
$: titleKey, stashStack;


// when we click a list item
function didClick(e) {
  console.log('did click', e);
  dispatch("didClick", e );
}

// below code borrowed from https://www.w3schools.com/howto/howto_js_todolist.asp

const stash = (item) => {
  stashStack.push(item);
}
const pop = () => {
  let item = stashStack.pop();
  return queue.push(item);
}

function close(e) {
  // TODO remove from queue
  console.log("removing item", e);
  queue.remove(e.detail)
  dispatch('removed', e);
}

onMount(async () => {
  console.log('ItemList mounted');

  if (dataStore) {
    console.log("dataStore mounted in ItemList");
    dataStore.subscribe((val) => {
      if (val) {
        console.log("ItemList update", val);
        if (dataKey) {
          queue = val[dataKey];
        } else {
          queue = val;
        }
      } else {
        queue = [];
      }
    });
  }

  if (dataSourcePath) {
    console.log("running dataSourcePath fetch", dataSourcePath);
    // dataStore.update((n) => _fetch(dataSourcePath));
    queue = (await _fetch({ uri: dataSourcePath })).result;
    console.log("dataSourcePath GOT", queue);
    if (dataStore) {
      dataStore.update(n => queue);
    }
  }

});

</script>


<section class="log-body">
  {#if queue}
    <ul id="task-list">
      {#if !readonly}
        <li>
          <div id="add-btn">
            <form on:submit|preventDefault={inputEvent}>
              <input type="text" id="task-input" placeholder="">
              <button type="submit">{buttonName}</button>
            </form>
          </div>
        </li>
      {/if}
      {#each queue as _item (_item.name) }
          <!-- use:linker={queue}
          class:checked={_item.checked}-->
        <li
          class="item"
          on:click={() => didClick(_item)}
        >
          {#if titleKey}
            <span>{_item[titleKey]}</span>
          {:else if transform}
            <span>{transform(_item)}</span>
          {/if}

          {#if buttons.length > 0}
            {#each buttons as prop (prop.name)}
              <div
                class="item-button"
                on:click|preventDefault={(e) => Promise.resolve(_item).then(prop.action).catch(printFailure)}
              >
                {prop.icon(_item)}
              </div>
            {/each}
          {/if}

          {#if !readonly}
            <span class="close" name={_item.name} on:click={close}>{"\u00D7"}</span>
          {/if}
        </li>
      {:else}
        <li>No Data</li>
      {/each}
    </ul>

  {:else}
    <p>No Data</p>
  {/if}
</section>

<style>

.item-button {
  top: 0;
  bottom: 0;
  width: 20px;
  height:  20px;
  border: 1px black;
  /*display: block;*/
}

/*.log-body {
  margin: 10px;
  min-width: 250px;
  width: 100%;
}*/

/* Include the padding and border in an element's total width and height */
* {
  box-sizing: border-box;
}

/* Remove margins and padding from the list */
ul {
  margin: 0;
  padding: 0;
}

/* Style the list items */
ul li {
  cursor: pointer;
  position: relative;
  padding: 12px;
  list-style-type: none;
  background: #eee;
  font-size: 16px;
  transition: 0.2s;
  width: 100%;

  /* make the list items unselectable */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Set all odd list items to a different color (zebra-stripes) */
ul li:nth-child(odd) {
  background: #f9f9f9;
}

/* Darker background-color on hover */
ul li:hover {
  background: #ddd;
}

/* When clicked on, add a background color and strike out text */
ul li.checked {
  background: #888;
  color: #fff;
  text-decoration: line-through;
}

/* Add a "checked" mark when clicked on */
ul li.checked::before {
  content: '';
  position: relative;
  border-color: #fff;
  border-style: solid;
  border-width: 0 2px 2px 0;
  top: 10px;
  left: 16px;
  transform: rotate(45deg);
  height: 15px;
  width: 7px;
}

/* Style the close button */
.close {
  position: relative;
  float: right;
  right: 0;
  top: 0;
  /*padding: 12px 16px 12px 16px;*/
}

.close:hover {
  background-color: #f44336;
  color: white;
}

/* Style the input */
#task-input input {
  margin: 0;
  border: none;
  border-radius: 0;
  padding: 5px;
  float: left;
  font-size: 14px;
}

/* Style the "Add" button */
#add-btn span {
  padding: 5px;
  width: 90%;
  background: #d9d9d9;
  color: #555;
  text-align: center;
  font-size: 16px;
  transition: 0.3s;
  border-radius: 0;
}

#add-btn:hover span {
  background-color: #bbb;
}

</style>
