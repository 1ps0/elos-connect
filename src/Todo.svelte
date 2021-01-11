<script>

import { onMount } from 'svelte';
import { writable } from "svelte/store";

import { historyWritable, filesWritable, todoWritable } from "./lib/stores.js"
import { updateHistory } from "./lib/apis.js";

import ItemList from "./ItemList.svelte";

let todoItems = [
  {
    checked: false,
    data: {
      name: "Coffee"
    },
  },
  {
    checked: false,
    data: {
      name: "Walk"
    },
  },
  {
    checked: false,
    data: {
      name: "Ring Fit"
    },
  },
  {
    checked: false,
    data: {
      name: "Monk"
    },
  },
  {
    checked: false,
    data: {
      name: "elos"
    },
  },
  {
    checked: false,
    data: {
      name: "social native"
    },
  }
];

todoWritable.update(n => [...(n || []), ...todoItems]);

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

</script>

<section>
  <ItemList
    dataStore={todoWritable}
    on:didClick={updateHistory}
    buttonName="Add"
    inputEvent={addEntry}
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
