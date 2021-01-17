<script>

import { onMount } from 'svelte';
import { writable } from "svelte/store";

import { historyWritable, filesWritable, todoWritable } from "./lib/stores.js"
import { updateHistory } from "./lib/apis.js";

import ItemList from "./ItemList.svelte";

export let dataStore = todoWritable;

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

todoWritable.update(n => [...(n.length > 0 ? n : todoItems)]);

function addEntry(e) {
  console.log('adding entry to listqueue:', e);
  let name = document.getElementById('task-input').value;
  if (dataStore) {
    // dataStore.update( n => [...n, {
    //   name: name,
    //   checked: false,
    //   eventClick: (e) => {}
    // }]);
  } else {

  }
}

function removeEntry(e) {
  console.log("removing entry from listqueue:", e);
  // TODO mark todo as removed
}

</script>

<section>
  <ItemList
    dataStore={todoWritable}
    on:didClick={updateHistory}
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
