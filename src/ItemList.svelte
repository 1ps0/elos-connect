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

import * as network from "./lib/network.js";
import * as proxy from "./lib/apis/proxy.js";

const dispatch = createEventDispatcher();

export let dataSourcePath = null;
export let dataStore = null;
export let dataKey = null;
export let readonly = false;
export let deletable = false;
export let transform = (x) => x;
export let buttons = [];

let dataSource = null;
let queue = [];

// TODO make this part of the toolbar
// TODO make 'add' trigger a writable

export let buttonName = "Add";
export let inputEvent = null;
export let titleKey = null;
$: readonly = !buttonName || !inputEvent;
$: titleKey;


// when we click a list item
function didClick(e) {
  console.log('did click', e);
  dispatch("didClick", e );
}

export const didClickButton = (item) => {
  return Promise.resolve(item)
    .then(_item => _item.prop.action(_item))
    .catch(proxy.print.failure_item_list)
}

function close(e) {
  return Promise.resolve(e)
    .then(proxy.print.status_close_remove_queue)
    .then(_e => _e.detail)
    .then(queue.remove)
    .catch(proxy.print.failure_close_remove_queue)
}

onMount(() => {
  proxy.print.success_ItemList_mounted();

  Promise.resolve(source)
    .then(_source => _source)
    .catch(proxy.print.failure_load_source)
    // dataStore.subscribe((val) => {
    //   if (val) {
    //     // console.log("ItemList update", val);
    //     if (dataKey) {
    //       queue = val[dataKey];
    //     } else {
    //       queue = val;
    //     }
    //   } else {
    //     queue = [];
    //   }
    // });
    // .catch(proxy.print.failure_itemlist_datastore_update);

  // Pull from a configured backend that conforms to given api
  // Promise.resolve(source)
  //   .then(_path => { uri: _path })
  //   .then(network._fetch)
  //   .then((result) => {
  //     queue = result
  //     return result;
  //   })
  //   .then((result) => {
  //     dataStore ? dataStore.update(n => result) : null;
  //   })
  //   .catch(proxy.print.failure_itemlist_data_source_path)

  proxy.print.success_source();
});

const squashItem = (title, length) => {
  return (title || "").slice(0,length);
}

</script>

<!-- <TreeNode items={queue} /> -->

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
        <li
          class="item"
          on:click={() => didClick(_item)}
        >
          <span>
          {#if titleKey}
            {squashItem(`${_item.tag || ""}${_item.tag ? ": " : " "}${_item[titleKey]}`, 50)}
          {:else if transform}
            {transform(_item)}
          {/if}
          </span>
          <!-- FIXME, breaks for buttons input -->
          {#each buttons as prop (prop.name)}
            <div
              class="item-button"
              on:click|preventDefault={(e) => didClickButton({
                item: _item,
                button: prop
              })}
            >
              {prop.icon(_item)}
            </div>
          {/each}

          {#if _item.deletable || deletable}
            <span class="close" name={_item.name} on:click={close}><i class="fas fa-times"></i></span>
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
  font-size: 13px;
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
</style>

<!---->