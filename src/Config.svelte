<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { stores } from "./lib/stores.js";
import { loadSites, loadHistory, loadCommands, notify, print } from "./lib/apis.js";
import { cmds } from "./lib/omnibox.js";

// suggested for OS
const OSTypes = [
  "default",
  "mac", // Ctrl -> Command, MacCtrl
  "linux",
  "windows",
  "chromeos",
  "android",
  "ios",
];


const getCommands = (params) => {

  // built-in events
const pluginEvents = [
  "_execute_sidebar_action",
  "_execute_page_action",
  "_execute_browser_action",
]


  // shortcut format (modifier + secondary modifier(?) + key)
  // modifier: "Ctrl", "Alt", "Command", "MacCtrl"
  // secondary: "Shift", "Ctrl", "Alt", "Command", "MacCtrl"
  // keys: A-Z, 0-9, F1-F12, Comma, Period, Home, End, PageUp, PageDown, Space, Insert, Delete, Up, Down, Left, Right, MediaNextTrack, MediaPlayPause, MediaPrevTrack, MediaStop

  // NOTE cant override existing keybinding of another extension
const defaultForEvent = (eventName) => {
  return {
    eventName: {
        "suggested_key": {
          "default": "Alt+Shift+G",
          "mac": "MacCtrl+E"
        },
        "description": `eLOS Connect - ${eventName.split('_').filter((word) => word.indexOf('execute', 'action') == -1}`
    }
  }
};

const renderEventDefaults = () => {
  return pluginEvents.map((eventName) => {
    return defaultForEvent(eventName);
  });
}

const enrichManifest = () => {
  browser.runtime.getManifest()
    .then((manifest) => {
      return {
        manifest.get('commands', {})
      }
    })
    .then((_manifest) => print.alert_new_manifest(_manifest))
    .catch(print.failure_enrich_manifest)
}

const setLogLevel = (level) => {
  return Promise.resolve(level)
    .then((_level) => stores.config.update((_config) => {
      ..._config,
      logLevel:_level
    })
    .catch(print.failure_set_log_level);
}

const resetCommand = (params) => {
  return Promise.resolve(params)
    .then(print.status_reset_params)
    .then(browser.commands.reset)
    .catch(print.failure_reset_command);
};

const updateCommand = (params) => {
  return Promise.resolve(params)
    .then(print.status_update_shortcut_params)
    .then((_params) => {
      name: _params.name,
      shortcut: _params.parent.input.value
    })
    .then(browser.commands.update)
    .then(notify.success_update_command)
    .catch(print.failure_reset_command);
};

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

onMount(async () => {
  print.success_Dashboard_mounted();
  // browser.commands.onCommand.addListener(updateCommand);
});

</script>

<section class="title">
  <span class="header">
    <span>eLOS Dashboard</span>
    <span use:clockTimer class="datetime"></span>
  </span>
<!--   <img use:profileEdit src="img/img_avatar.png" alt="Avatar" class="avatar"/>
 -->
  <p>
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
<!--
  TODO RemoteConfig - status, remote version, available routes/functions, auth/active session(s), storage type and capacity,

  Config is just workspace.js

    <h3>List of Commands</h3>
      <div id="item-list">
        {#each Object.entries(cmds) as name, children}
          {#each Object.entries(children) as childName, childValue}
            {#if childName === 'description'}
              <p><a on:click|preventDefault={children.action}>{subCmd}</a> : {childValue}</p>
            {:else}
              <p><a on:click|preventDefault={cmds[cmd].action}>{cmd}</a> : {cmds[cmd].description}</p>
            {/if}
          {/each}
        {/each}
      </div>
    <br>
    <h3>Change Color Scheme</h3>
    <br>

    <h3>Sync Data Now</h3>
    <br>

    <h3>Export saved locations</h3>
    <br>

    <h3>View Data Stores</h3>
    <br>
    <h3>Explore Store</h3>
    <br>

 -->
</section>


<style>

</style>
