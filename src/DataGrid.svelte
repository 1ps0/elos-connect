
<script>

import { onMount } from 'svelte';

import DataGrid from 'svelte-data-grid';
import TextboxCell from './cell/textbox-cell.svelte';
import SelectCell from './cell/select-cell.svelte';
import CheckboxCell from './cell/checkbox-cell.svelte';

import { _fetch, _send } from "./lib/apis.js";

export let dbName = "metrics";

export let columns = [];
export let rows = [];
export let sortFn;
export let filterFn;

let grid;
let allowResizeFromTableCells = true;
let allowResizeFromTableHeaders = true;
let allowColumnReordering = true;
let rowHeight = 50;

$: {
  if (grid) {
    grid.$on('valueUpdated', (e) => {
      console.log('grid value updated', e);
    });
  }
}

$: sortFn;
$: filterFn;

const updateData = async () => {
  let results = await _fetch(`/api/db/${dbName}`);
  console.log("DataGrid Fetch", results);
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

function valueUpdated(e) {
  console.log('value updated', e);
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

onMount(async () => {
  console.log("DataGrid mounted");

  await updateData();
  // addNewRow();
});


</script>


<section class="grid-wrap">
  <button on:click={addNewRow}>Add</button>
  <button on:click={pushValues}>Save</button>
  <DataGrid
    bind:this={grid}
    bind:rows={rows}
    bind:columns={columns}
    on:valueUpdated={valueUpdated}
    bind:allowResizeFromTableCells={allowResizeFromTableCells}
    bind:allowResizeFromTableHeaders={allowResizeFromTableHeaders}
    bind:allowColumnReordering={allowColumnReordering}
    bind:rowHeight={rowHeight}
  />
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
