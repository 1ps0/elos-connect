<script>

import { onMount } from 'svelte';
import { writable } from "svelte/store";

import { stores } from "./lib/stores.js"
import { updateLog } from "./lib/apis.js";

import ItemList from "./ItemList.svelte";

export let dataStore = stores.todo;

let todoItems = [
  {
    type: "action",
    category: "drink",
    name: "Coffee",
    value: "count",
    checked: false,
  },
  {
    type: "action",
    category: "exercise",
    name: "Walk",
    value: "duration",
    checked: false,
  },
  {
    type: "action",
    category: "exercise",
    name: "Ring Fit",
    value: "duration",
    checked: false,
  },
  {
    type: "action",
    category: "project",
    name: "Monk",
    value: "duration",
    checked: false,
  },
  {
    type: "action",
    category: "project",
    name: "ELOS*",
    value: "duration",
    checked: false,
  },
  {
    type: "action",
    category: "work",
    name: "Work",
    value: "duration",
    checked: false,
  }
];

function addEntry(e) {
  console.log('adding entry to listqueue:', e);
  let name = document.getElementById('task-input').value;
  if (dataStore) {
    dataStore.update( n => [...n, {
      name: name,
      checked: false,
      eventClick: (_n) => {
        return _n.filter((value) => value.name === name);
      }
    }]);
  } else {
    console.log("[todo.py] NO DATASTORE");
  }
}

function removeEntry(e) {
  console.log("removing entry from listqueue:", e);
  var name = e.detail.name;
  dataStore.update(n => _n.filter((value) => value.name !== name));
}

function clearLog(e) {

}


onMount(async () => {
  console.log('Todo mounted');

  dataStore.update(n => [...(n.length > 0 ? n : todoItems)]);
});

</script>

<section>
  <p>
    <button id="clear" on:click={clearLog}>
    </button>
  </p>
  <ItemList
    dataStore={dataStore}
    on:didClick={updateLog}
    buttonName="Add"
    titleKey="name"
    inputEvent={addEntry}
    on:removed={removeEntry}
  />
</section>

<style>

table {
  padding: 20px 20px 20px 20px;
}

tr {
  text-transform: uppercase;
  font-size: 1em;
}

.header tr {
  color: #ff3e00; /* blue */
}

.control tr {
  color: #ff3e00; /* orange */
}

#prompt-table {

}

</style>
