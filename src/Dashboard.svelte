<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { stores } from "./lib/stores.js";
import { loadSites, loadHistory, loadCommands, notify, print } from "./lib/apis.js";
import { cmds } from "./lib/omnibox.js";

// import { commandLine } from "./lib/commandLine.js";
// import { profileEdit } from "./lib/profileEdit.js";
// import { clockTimer, clockStore } from "./lib/clock.js";

const dashboardContext = getContext("dashboard");

const getCommands = (params) => {

  // built-in events
  "_execute_sidebar_action"
  "_execute_page_action"
  "_execute_browser_action"


  // suggested for OS
  "default"
  "mac" // Ctrl -> Command, MacCtrl
  "linux"
  "windows"
  "chromeos"
  "android"
  "ios"

  // shortcut format (modifier + secondary modifier(?) + key)
  // modifier: "Ctrl", "Alt", "Command", "MacCtrl"
  // secondary: "Shift", "Ctrl", "Alt", "Command", "MacCtrl"
  // keys: A-Z, 0-9, F1-F12, Comma, Period, Home, End, PageUp, PageDown, Space, Insert, Delete, Up, Down, Left, Right, MediaNextTrack, MediaPlayPause, MediaPrevTrack, MediaStop

  // NOTE cant override existing keybinding of another extension
  // {
  //   "event_name": {
  //       "suggested_key": {
  //           "default": "MacCtrl+E"
  //       },
  //       "description": "eLOS Connect save"
  //   }
  // }
}

const resetCommand = async (params) => {
  return browser.commands.reset(params.name)
    .catch(print.failure);
};

const updateCommand = async (params) => {
  console.log("update shortcut params", params);
  browser.commands.update({
    name: params.name,
    shortcut: params.parent.input.value
  })
  .then(notify.success)
  .catch(print.failure);
};

const bucketHistory = async (results) => {
  // TODO turn this into a dict/bucket set
  // with key:uri-domain, values:[history-obj]
  return results;
}

const isAudible = async (params) => {
  // TODO return if the given tab counts as audible
  // different strategies like tab state and url domain or sendMessage
  return true;
}

const addHost = (params) => {
  return Promise.resolve(params) // e.value
    .then((_input) = _input.text)
    // TODO validate input as name
    .then(print.status_add_host)
    // TODO ... do something with the value
    .catch(print.failure_add_host)
}

const loadHosts = (params) => {
  return Promise.resolve(params)
    .then((_params) => {
      return browser.storage.local.get('config')
    })
    .then((data) => [data['config'].host])
    .catch(print.failure_load_hosts);
}

const browserStats = async (params) => {

  // count of videos
  // percentage isArticle
  // count of isReaderMode
  //
  return Promise.resolve({})
      .then(browser.tabs.query)
      .then((tabs) => {
        return tabs.map((tab) => {
          return {
            tabId: tab.id,
            url: tab.url,
            title: tab.title,
            windowId: tab.windowId,
            isArticle: tab.isArticle,
          }
        })
      })
      .then((data) => {
        return {
          count_videos: data.filter((tab) => isAudible(tab)).length,
          count_article: data.filter((tab) => tab.isArticle).length,
          per_is_article: data.filter((tab) => tab.isArticle).length / data.length,
        }
      })
      .catch(print.failure);

}


onMount(async () => {
  print.success_Dashboard_mounted();
  // browser.commands.onCommand.addListener(updateCommand);
});

</script>

<section class="title">
  <!-- <input use:commandLine type="text" name="input" id="search" />
  <span class="header">
    <span>eLOS Dashboard</span>
    <span use:clockTimer class="datetime"></span>
  </span>-->
<!--   <img use:profileEdit src="img/img_avatar.png" alt="Avatar" class="avatar"/>
 -->
  <p>
<!--     <h3>System Info</h3>
    <ul>
      <li><label>PlatformOs</label>{browser.runtime.PlatformOs}</li>
      <li><label>PlatformArch</label>{browser.runtime.PlatformArch}</li>
      <li><label>PlatformInfo</label>{browser.runtime.PlatformInfo.os}</li>
      <li><label>PlatformInfo</label>{browser.runtime.PlatformInfo.arch}</li>
      <li><label>PlatformInfo</label>{browser.runtime.PlatformInfo.nacl_arch}</li>
    </ul> -->
    <h3>Goodbye</h3>
      <ul>
        <!-- <li><label></label>{}</li> -->
      </ul>
    <br>
    <h3>Set Remote host</h3>
    <div>
      <ul>Add New: <input on:submit={addHost} type="text"/></ul>
      {#await loadHosts() then hosts}
        {#each hosts as host}
          <li>
            <p>{host.name}</p>
            <p>{host.uri}</p>
          </li>
        {/each}
      {:catch failure}
      <p>Failed to load remote hosts: {failure}</p>
      {/await}
      <ul></ul>
    </div>
    <br>
    <h3>Keyboard shortcut</h3>
    {#await loadCommands() then commands}
      <div id="item-list">
        {#each commands as cmd}
        <p>
          <span>{cmd.name}</span>
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

    <h3>List of Commands</h3>
      <div id="item-list">
<!--
        {#each Object.keys(cmds) as cmd}
          {#each Object.keys(cmd) as subCmd}
            {#if cmds[cmd][subCmd] && cmds[cmd][subCmd].description}
              <p><a on:click|preventDefault={cmds[cmd][subCmd].action}>{subCmd}</a> : {cmds[cmd][subCmd].description}</p>
            {:else}
              <p><a on:click|preventDefault={cmds[cmd].action}>{cmd}</a> : {cmds[cmd].description}</p>
            {/if}
          {/each}
        {/each} -->
      </div>
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
      {#await bucketHistory(loadSites()) then data}
        <div id="item-list">
          {#each data.sites as site (site.title)}
            <p><a href="{site.url}">{site.title}</a></p>
          {/each}
        </div>
      {:catch failure}
        <p>Failed to load topSites: {failure}</p>
      {/await}
    <br>

    <h3>Browsing History breakdown</h3>
      {#await bucketHistory(loadHistory()) then history}
        <div id="item-list">
          {#each history as item (item.title)}
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

</section>


<style>

</style>
