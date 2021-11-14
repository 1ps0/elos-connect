
<script>

import { onMount } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import DataGrid from 'svelte-data-grid';
import TextboxCell from './cell/textbox-cell.svelte';
import SelectCell from './cell/select-cell.svelte';
import CheckboxCell from './cell/checkbox-cell.svelte';

import Select from "./Select.svelte";

import { _fetch, _send } from "./lib/apis.js";
import { stores } from "./lib/stores.js"


let grid;
let allowResizeFromTableCells = true;
let allowResizeFromTableHeaders = true;
let allowColumnReordering = true;
let rowHeight = 50;

$: {
  if (grid) {
    grid.$on('[DataGrid] valueUpdated', (e) => {
      console.log('grid value updated', e);
    });
  }
}

const updateData = async () => {
  let results = await _fetch({ uri: `/api/db/${dbName}`});
  console.log("[DataGrid] Fetch", results);
  columns = renderColumns(results['columns']);
  rows = renderRows(results);
}
// $: updateData();




function renderColumns(columns) {
  let grid_el = document.getElementsByClassName("grid-wrap");
  if (grid_el == undefined) {
    return;
  }
  return columns.map((val, i) => {
    console.log(val);
    return {
      display: val,
      dataName: val,
      width: grid_el == undefined ?
        Math.floor(grid_el.clientWidth / columns.length) :
        75,
      cellComponent: TextboxCell
    };
  });
}

function rowDefaults() {
  return {
    metric_id: null,
    entity_id: "me",
    name: "stress",
    value_string: null,
    timestamp: Date.now()
  };
}

function addNewRow() {
  // rows.push();
  rows.push(rowDefaults());
  rows = rows;
}

function submitChanges() {

}

function zip(keys, vals) {
  return keys.reduce((m, key, index) => {
    m[key] = vals[index];
    return m;
  }, {});
}

function renderRows(data) {
  return data.rows.map((row, row_i) => {
    return zip(data.columns, row);
  });
}


function pushValues() {
  const { columns } = grid.get();

  _send("/api/db/metrics", params={
    body: {
      columns: grid.get(),
      rows: grid.data
    }
  })
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log("got error on fetch", error);
  });
}

// export let dbName = "metrics";
// export let columns = [];
// export let rows = [];
// export let sortFn;
// export let filterFn;
// $: sortFn, filterFn;

export let dataStore = null;
export let dataKey = null;
export let selectedTable = null;

export let data = {
  rows: [],
  columns: [],
  name: "",
  storeName: "",
  category: 'metrics'
};

let tableTypes = {
  stress: {
    storeName: 'profile',
    name: 'stress',
    fields: [ "name", "value", "range", "at" ]
  },
  calories: {
    storeName: 'profile',
    name: 'calories',
    fields: [ "name", "count", "from", "at" ]
  },
};



let selectWatcher = writable({ // Select value interface
  label: 'Data Types',
  options: Object.values(tableTypes),
  value: selectedTable || Object.values(tableTypes)[0]
});

onMount(async () => {
  console.log("DataGrid mounted");

  // await updateData();
  // addNewRow();

  if (dataStore) {
    dataStore.subscribe((val) => {
      console.log("[DataGrid] profile updated", val);
    });
  }

  if (selectWatcher) {
    selectWatcher.subscribe((val) => {
      console.log("[DataGrid] selectWatcher updated", val, dataKey);
      selectedTable = val.value;
      if (selectedTable) {
        data.store = stores[selectedTable.storeName];
        data.columns = selectedTable.fields.map((field) => ({
          display: field,
          dataName: field,
          width: 100, //field.length*10,
        }));
        data.rows = get(data.store)[dataKey].filter((x) => x.name == selectedTable.name);
        console.log('=>>', data.rows);
      }
    });
  }
});

function valueUpdated(e) {
  console.log('value updated', e);
  // data.value = e;
}

function add(x, y) {
  return x + y;
}

</script>


<section class="grid-wrap">
  <button on:click={addNewRow}>Add</button>
  <button on:click={pushValues}>Save</button>
  <Select bind:watcher={selectWatcher}/>
  {#if selectedTable}
    <DataGrid
      bind:this={grid}
      bind:rows={data.rows}
      bind:columns={data.columns}
      on:valueUpdated={valueUpdated}
      bind:allowResizeFromTableCells={allowResizeFromTableCells}
      bind:allowResizeFromTableHeaders={allowResizeFromTableHeaders}
      bind:allowColumnReordering={allowColumnReordering}
      bind:rowHeight={rowHeight}
    />
  {/if}
</section>



<style>

.grid-wrap {
  font-size: 14px;
  width: 95%;
  height: 50vh;
  margin: 0 auto;
  resize: inherit;
  overflow: auto;
  /*min-height: 100%;*/
  /*height: 5em;*/
  /*border: 1px solid black;*/
}

</style>
