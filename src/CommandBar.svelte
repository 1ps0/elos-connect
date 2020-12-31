<script>
import { onMount } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";
import { commandLine } from "./lib/commandLine.js";

onMount(async () => {
  console.log('CommandBar mounted');
});

</script>

<section class="title">
  <span class="header">
    <input use:commandLine type="text" name="input" id="search" />
  </span>
</section>

<style>

.header {
  text-align: left;
  border: 1px solid black;
  padding: 5px 20px 10px 10px;
}

.title {
  background-color: #ccc;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  outline: none;
}

 /* Style the search box */
#search {
  width: 50%;
  font-size: 18px;
  padding: 11px;
  border: 1px solid #ddd;
  float: left;
}


</style>