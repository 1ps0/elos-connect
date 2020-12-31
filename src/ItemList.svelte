<script>
import { createEventDispatcher, onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";
import { linker } from "./lib/linker.js";

const dispatch = createEventDispatcher();

export let dataStore;
export let readonly = false;

let queue = [];
$: console.log('queue -->', queue);

// TODO make this part of the toolbar
// TODO make 'add' trigger a writable
function addEntry(e) {
  console.log('adding entry to listqueue:', e);
  let name = document.getElementById('task-input').value;
  dataStore.update( n => [...n, {
    data: {
      name: name
    },
    checked: false,
    eventClick: (e) => {}
  }]);
}

// when we click a list item
function didClick(e) {
  console.log('did click', e);
  dispatch("didClick", { name: e.target.firstChild.wholeText,  } );
}

// below code borrowed from https://www.w3schools.com/howto/howto_js_todolist.asp

onMount(async () => {
  console.log('ItemList mounted');

  if (dataStore) {
    console.log("dataStore mounted in listview");
    dataStore.subscribe((val) => {
      console.log("listqueue update", val);
      queue = val;
    });
  }
});

function close(e) {
  // TODO remove from queue
  var div = e.target.parentElement;
  div.style.display = "none";
  dispatch('removed', item);
}

function markAsDone(e) {
  let item = e.item;
  console.log('------>', item);
  // TODO remove from this queue and pass to callback/update to next queue
  item.checked = true;
  dispatch('markedDone', item);
}

</script>


<section class="log-body">
    <ul id="task-list">
      {#if !readonly}
        <li>
          <div id="add-btn">
            <input type="text" id="task-input" placeholder="">
            <span on:click={addEntry}>Add</span>
          </div>
        </li>
      {/if}
      {#each queue as item}
        <li
          use:linker={queue}
          class:checked={item.checked}
          class="item"
        >
          {#each Object.entries(item.data || {}) as entry}
            <div class="entry">
              <span class="key">{entry[0]}</span>:
              <span class="value">{entry[1]}</span>
            </div>
          {/each}
          <span class="close" on:click={close}>{"\u00D7"}</span>
        </li>
      {/each}
    </ul>
</section>

<style>

.type-study span {
  float:left;
  background-color: green;
  width: 100%;
}

.type-label span {
  border: 1px solid black;
  padding: 10px 30px 10px 30px;
  margin: 5px;
  border-radius: 5px;
  padding: 15px;
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
  padding: 12px 16px 12px 16px;
}

.close:hover {
  background-color: #f44336;
  color: white;
}

/* Style the header */
.header {
  background-color: gray;
  padding: 20px 30px;
  color: white;
  text-align: center;
}

/* Clear floats after the header */
.header:after {
  content: "";
  display: table;
  clear: both;
}

/* Style the input */
#task-input input {
  margin: 0;
  border: none;
  border-radius: 0;
  width: 75%;
  padding: 10px;
  float: left;
  font-size: 16px;
}

/* Style the "Add" button */
#add-btn span {
  padding: 10px;
  width: 50px;
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
