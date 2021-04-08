<script>
import { onMount } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { commandOptionsWritable} from "./lib/stores.js";
import { commandLine } from "./lib/commandLine.js";

import AutoComplete from './AutoComplete.svelte';

const tagColors = ['#000', '#3298dc', '#f14668', '#48c774', '#3273dc']
const searchModifiers = ['cmd', 'files', 'do', 'panel', 'profile', 'settings']

export let options = [];
export let selectedOptions = [];

commandOptionsWritable.subscribe(val => {
  console.log("history", val.history())
});

const _handleSubmit = (selectedValue, category) => {
  if (options.indexOf(selectedValue) === -1) {
    options = [...options, selectedValue]
  }
  if (selectedOptions.indexOf(selectedValue) === -1) {
    selectedOptions = [...selectedOptions, selectedValue]
  }
}
const handleSubmit = (e) => {
  _handleSubmit(e.selected, searchModifiers);
};

onMount(async () => {
  console.log('CommandBar mounted');
});

</script>

<section class="title">
  <span class="header" use:commandLine={commandOptionsWritable}>
    <AutoComplete
      {options}
      {searchModifiers}
      onSubmit={handleSubmit}
      themeColor={tagColors[4]}
    />

  </span>
</section>

<style>

.header {
}

.title {
  color: #444;
  width: 100%;
  padding: 4.5px;
}

 /* Style the search box */
#search {
  /*width: 90%;*/
  font-size: 16px;
  text-align: left;
  /*float: left;*/
}


</style>