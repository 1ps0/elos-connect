<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { stores } from "./lib/stores.js";
import { loadSites, loadHistory, loadCommands } from "./lib/apis.js";
import { cmds } from "./lib/omnibox.js";

// import { commandLine } from "./lib/commandLine.js";
import { profileEdit } from "./lib/profileEdit.js";
// import { clockTimer, clockStore } from "./lib/clock.js";

const dashboardContext = getContext("dashboard");

const updateCommand = async (params) => {
  return browser.commands.update(params.name, )
}

const resetCommand = async (params) => {
  return browser.commands.reset(params.name)
    .catch(printFailure);
};

const updateOnCommand = async (params) => {

};

onMount(async () => {
  console.log('Dashboard mounted');
  browser.commands.onCommand.addListener(updateOnCommand);
});

</script>

<section class="title">
  <!-- <input use:commandLine type="text" name="input" id="search" />
  <span class="header">
    <span>eLOS Dashboard</span>
    <span use:clockTimer class="datetime"></span>
  </span>-->
  <img use:profileEdit src="img/img_avatar.png" alt="Avatar" class="avatar"/>

  <p>
    <h3>Set Remote host</h3>
    <br>
    <h3>Keyboard shortcut</h3>
    {#await loadCommands() then commands}
      <div id="item-list">
        {#each commands as cmd}
        <p>
          <label>{cmd.name}</label>
          <input type="text" id="shortcut" value={cmd.shortcut}>
          <button id="update" name={cmd.name} on:click={updateCommand}>Update</button>
          <button id="reset" name={cmd.name} on:click={resetCommand}>Reset</button>
        </p>
        {/each}
      </div>
    {:catch failure}
      <p>Failed to load commands: {failure}</p>
    {/await}
    <br>

    <h3>Change Color Scheme</h3>
    <br>

    <h3>Sync Data Now</h3>
    <br>

    <h3>Export saved locations</h3>
    <br>

    <h3>Open saved media folder</h3>
    <br>

    <h3>History Top Sites</h3>
      {#await loadSites() then data}
        <div id="item-list">
          {#each data.sites as site}
            <p><a href="{site.url}">{site.title}</a></p>
          {/each}
        </div>
      {:catch failure}
        <p>Failed to load topSites: {failure}</p>
      {/await}
    <br>

    <h3>Browsing History breakdown</h3>
      {#await loadHistory() then history}
        <div id="item-list">
          {#each history as item}
            <p><a href="{item.url}">{item.title}</a></p>
          {/each}
        </div>
      {:catch failure}
        <p>Failed to load history: {failure}</p>
      {/await}
    <br>

    <h3>Top Songs</h3>
    <br>
    <h3>Top Activities</h3>
    <br>
    <h3>View Data Stores</h3>
    <br>
    <h3>Explore Store</h3>
    <br>

    <h3>List of Commands</h3>
      <div id="item-list">
        {#each Object.keys(cmds) as cmd}
        <p>{cmd} -- {cmds[cmd].description}</p>
        {/each}
      </div>
    <br>

    <h3></h3>
    <br>
    <h3></h3>
    <br>
    <h3></h3>
    <br>
    <h3></h3>
    <br>
    <h3></h3>
    <br>
    <h3></h3>
    <br>
  <!-- </p> -->
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
