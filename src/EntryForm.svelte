<script>
// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_contact_form
/*
TODO
1. add metric for DataGrid panel
2. handle Poll/prompt type inputs
3.
*/


import { onMount, createEventDispatcher, getContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import Select from "./Select.svelte";
import { dateStringNow } from "./lib/clock.js";
// import { _fetch } from "./lib/api.js";
import { pollTypes, fieldTypes } from "./config/polls.js";

const dispatch = createEventDispatcher();

// externally filled or not at all
export let item;
export let dataStore = null;
export let dataKey = "metrics";

// internal
export let selectedForm = null;
$: selectedForm;

function doSubmit(e) {
  let selector = document.querySelector('#entryform');
  let data = new FormData(selector);

  if (dataStore) {
    console.log("EntryForm got data", data);
    dataStore.update(n => {
      console.log("datastore got data", n);

      n[dataKey] = n[dataKey] || {};
      n[dataKey][selectedForm.name] = [
        ...(n[dataKey][selectedForm.name] || []),
        {
          name: selectedForm.name,
          title: selectedForm.title,
          category: selectedForm.category,
          context: selectedForm.context,
          at: Date.now(),
          data: selectedForm.fields.map(n => {
            return [n.name, n.value];
          })
        }
      ];

      return n;
    });
  }
}

let formWatcher = writable({
  ...fieldTypes.entry_type,
  value: null
});

onMount(async () => {
  console.log('EntryForm mounted');
  if (formWatcher) {
    formWatcher.subscribe((val) => {
      console.log("selectedForm updated", val);
      selectedForm = val.value;
    });
  }
});

</script>

<section>
<!-- using stopprop works, but stops all dragging -->
<div class="container" on:pointerdown|stopPropagation>
  <Select bind:watcher={formWatcher}/>
  <form id="entryform" on:submit|stopPropagation|preventDefault={doSubmit}>
    {#if selectedForm}
      <label for="{selectedForm.name}">{selectedForm.title}</label>
      <label name="sub-title">
        {#if selectedForm.message}
          <span>{selectedForm.message}</span>
        {/if}
      </label>
      {#each selectedForm.fields as field}
        <label for="{field.name}">
          {#if field.label}
            <span>{field.label}</span>
          {/if}
          {#if field.value && field.showValue}
            <span>{field.value}</span>
          {/if}
        </label>

        {#if field.type === "number"}
          <input
            id="{field.name}"
            type="number"
            name="{field.name}"
            placeholder="{field.placeholder}"
            bind:value={field.value}
          >

        {:else if field.type === "text"}
          <input
            id="{field.name}"
            type="text"
            name="{field.name}"
            placeholder="{field.placeholder}"
            bind:value={field.value}
          >

        {:else if field.type === "select"}
          <select
            id="{field.name}"
            name="{field.name}"
            bind:value={field.value}
          >
          {#each field.options as _item}
              <option value="{_item.value}" on:change>
                {_item.title}
              </option>
          {/each}
          </select>

        {:else if field.type === "entry"}
          <textarea
            id="{field.name}"
            name="{field.name}"
            placeholder="{field.placeholder}"
            bind:value={field.value}
            style="height:200px"
            rows={field.rows || 2}
            cols={field.cols || 20}
          />

        {:else if field.type === "slider"}
          <input
            id={field.name}
            name={field.name}
            class="slider"
            type="range"
            min="{field.min}"
            max="{field.max}"
            bind:value={field.value}>
        {/if}
      {/each}
      <input type="submit" value="Submit" on:submit|preventDefault={doSubmit}>
    {/if}
  </form>
</div>

</section>

<style>

input[type=number] {
  width: 80%;
  padding: 5px;
}

input[type=text], select, textarea {
  width: 80%;
  padding: 5;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 6px;
  margin-bottom: 16px;
  resize: vertical;
}

input[type=submit] {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input[type=submit]:hover {
  background-color: #45a049;
}

.container {
  border-radius: 5px;
  background-color: #f2f2f2;
  padding: 20px;
}

/* https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_rangeslider */
.slider {
  -webkit-appearance: none;
  width: 80%;
  height: 25px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: #4CAF50;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: #4CAF50;
  cursor: pointer;
}

</style>
