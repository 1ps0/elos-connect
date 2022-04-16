<script>

import { onMount } from 'svelte';

import { stores } from "./lib/stores.js"
import { updateLog } from "./lib/apis.js";

import ItemList from "./ItemList.svelte";

export let dataStore = stores.todo;

let template1 = [
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
    name: "eLOS",
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

let todoItems = [];

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

function clearLog(e) {}


onMount(async () => {
  print.success_Todo_mounted();

  dataStore.update(n => [...(n.length > 0 ? n : todoItems)]);
});

/*
ADD state awareness:
- daily cycles
-

ADD FUNCTION BUTTONS:
1. pin TODO item for every day or once
2. hide until tomorrow
3. check off (and hide until tomorrow)
4.
*/

</script>

<section>
  <p>
    <button id="clear" on:click={clearLog}>Clear</button>
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
</style>
