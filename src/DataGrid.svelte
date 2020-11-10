
<script>

import { onMount } from 'svelte';
import DataGrid from 'svelte-data-grid';
import TextboxCell from './cell/textbox-cell.svelte';
import SelectCell from './cell/select-cell.svelte';
import CheckboxCell from './cell/checkbox-cell.svelte';

const axios = require('axios');

export let item = {
  h: 2,
  w: 2,
  x: 2,
  y: 0,
  component: DataGrid,
  target: "menu-item-metrics",
  name: "Metrics"
};

export let columns = [];
export let rows = [];
export let sortFn;
export let filterFn;

let grid;
let allowResizeFromTableCells = true;
let allowResizeFromTableHeaders = true;
let allowColumnReordering = true;
let rowHeight = 50;

$: columns;
$: rows;
$: sortFn;
$: filterFn;
// $: {
//  grid.rows
// };


async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  cb(await ret.json());
};

function render_columns(columns) {
  let grid_el = document.getElementsByClassName("grid-wrap");
  if (grid_el == undefined) {
    return;
  }
  return columns.map((val, i) => {
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

function add_new_row() {
  rows.push({
    metric_id: null,
    entity_id: "me",
    name: "stress",
    value_float: null,
    value_integer: null,
    value_json: null,
    value_string: null,
    timestamp: Date.now()
  });
  rows = rows;
}

function submit_changes() {

}

function zip(keys, vals) {
  return keys.reduce((m, key, index) => {
  m[key] = vals[index];
  return m;
  }, {});
}

function render_rows(data) {
  return data.rows.map((row, row_i) => {
    return zip(data.columns, row);
  });
}

function value_updated(e) {
  console.log('value updated', e);
}

function push_values() {
  console.log("grid data:",grid.data);
  return;
  const { columns } = grid.get();

  axios.post("/api/db/metrics", {
    columns: grid.get(),
    rows: grid.data
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
  await fetch_("/api/db/metrics", (ret) => {
    console.log(ret);
    columns = render_columns(ret['columns']);
    rows = render_rows(ret);
    console.log(rows);
  });
  if (grid == null)
    return;

  grid.$on('valueUpdated', (e) => {
    console.log('grid value updated', e);
  });
  console.log(rows);

  // add_new_row();
});


</script>


<section class="grid-wrap">
  <button on:click={add_new_row}>Add</button>
  <DataGrid
    bind:this={grid}
    bind:rows={rows}
    bind:columns={columns}
    on:valueUpdated={value_updated}
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
  margin: 0 auto;
  resize: inherit;
  overflow: auto;
  /*min-height: 100%;*/
  /*height: 5em;*/
  /*border: 1px solid black;*/
}

</style>
