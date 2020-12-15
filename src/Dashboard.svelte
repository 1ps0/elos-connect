<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";
import { commandLine } from "./lib/commandLine.js";
import { profileEdit } from "./lib/profileEdit.js";
import { clockTimer, clockStore } from "./lib/clock.js";

// import Overview from "./Overview.svelte";

const dashboardContext = getContext("dashboard");

onMount(async () => {
  console.log('Dashboard mounted');
});

</script>

<section class="title">
  <input use:commandLine type="text" name="input" id="search" />
  <span class="header">
    <span>eLOS Dashboard</span>
    <span use:clockTimer class="datetime"></span>
  </span>
  <img use:profileEdit src="img/img_avatar.png" alt="Avatar" class="avatar"/>
    <!-- <Overview /> -->
</section>


<style>

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

.header {
  text-align: left;
  border: 1px solid black;
  padding: 5px 20px 10px 10px;
}

.datetime {
  font-size: 20px;
  padding: 10px;
}

.avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  /*float: right;*/
  border-radius: 50%;
}
</style>
