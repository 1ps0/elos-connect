<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";
import { commandLine } from "./lib/commandLine.js";
import { profileEdit } from "./lib/profileEdit.js";

// import Overview from "./Overview.svelte";

let dayNow, timeNow;
$: dayNow = (new Date()).toLocaleDateString();
$: timeNow = (new Date()).toLocaleTimeString();

const dashboardContext = getContext("dashboard");

onMount(async () => {
    console.log('Dashboard mounted');
});

</script>

<div id="main">
    <p class="title">
        <input use:commandLine type="text" name="input" id="search" />
        <span class="header">
            eLOS Dashboard
            <img use:profileEdit src="img/img_avatar.png" alt="Avatar" class="avatar"/>
            <span class="datetime">{dayNow} | {timeNow}</span>
        </span>
    </p>
    <!-- <Overview /> -->
</div>


<style>

.title {
    background-color: #ccc;
    color: #444;
    cursor: pointer;
    padding: 18px;
    width: 96%;
    border: none;
    outline: none;
}

 /* Style the search box */
#search {
  width: 100%;
  font-size: 18px;
  padding: 11px;
  border: 1px solid #ddd;
}

.header {
    text-align: left;
    border: 1px solid black;
    padding: 10px 20px 10px 20px;
}

.datetime {
    font-size: 20px;
    padding: 10px;
}

.avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  float: right;
  border-radius: 50%;
}
</style>
