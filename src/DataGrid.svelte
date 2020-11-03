
<script>

import { onMount } from 'svelte';
import DataGrid from 'svelte-data-grid';
import TextboxCell from './cell/textbox-cell.svelte';
import SelectCell from './cell/select-cell.svelte';
import CheckboxCell from './cell/checkbox-cell.svelte';

const axios = require('axios');

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
    var grid_el = document.getElementsByClassName("grid-wrap")[0];
    return columns.map((val, i) => {
        return {
            display: val,
            dataName: val,
            width: Math.floor(grid_el.clientWidth / columns.length),
            cellComponent: TextboxCell
        };
    });
}

function add_new_row() {
    rows.push({
        metric_id: 3,
        entity_id: "me",
        name: "stress",
        value_float: 0.5,
        value_integer: null,
        value_json: null,
        value_string: null,
        timestamp: 1604201304
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

    grid.$on('valueUpdated', (e) => {
        console.log('grid value updated', e);
    });
    console.log(rows);

    // add_new_row();
});


</script>

<div class="grid-wrap">
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
</div>
<div class="controls">
    <div>
        <label>
            <input type="checkbox" bind:checked={allowResizeFromTableCells}> Allow resize from table cells
        </label>
    </div>
    <div>
        <label>
            <input type="checkbox" bind:checked={allowResizeFromTableHeaders}> Allow resize from table headers
        </label>
    </div>
    <div>
        <label>
            <input type="checkbox" bind:checked={allowColumnReordering}> Allow dragging columns to new location
        </label>
    </div>
    <div>
        Row Height: <input type="number" bind:value={rowHeight}>
    </div>
</div>



<style>

:global(*) {
    box-sizing: border-box;
}

.header {
    text-align: center;
}

.controls {
    width: 40%;
    margin: 2em auto;
}
.grid-wrap {
    font-size: 14px;
    width: 70%;
    margin: 0 auto;
    height: calc(100vh - 300px);
    border: 1px solid black;
}

</style>
