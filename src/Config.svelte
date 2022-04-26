<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { stores } from "./lib/stores.js";
import { loadSites, loadHistory, loadCommands, notify, print } from "./lib/apis.js";
import { cmds } from "./lib/omnibox.js";
import { workspaceConfig } from "./workspace.js";

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


const getCommands = (params) => {};

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
      // "description": `eLOS Connect - ${eventName.split('_').filter((word) => word.indexOf('execute', 'action') == -1}`
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
    .then(print.status_get_manifest)
    .then((manifest) => {
      return {
        ...manifest.get('commands', {})
      }
    })
    .then((_manifest) => print.alert_new_manifest(_manifest))
    .catch(print.failure_enrich_manifest)
}

const setLogLevel = (level) => {
  return Promise.resolve(level)
    .then((_level) => {
      return stores.config.update((current) => ({
        ...current,
        logLevel: _level
      }))
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
    .then((_params) => ({
      name: _params.name,
      shortcut: _params.parent.input.value
    }))
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

const loadHosts = () => {
  return Promise.resolve('hosts')
    .then((_params) => {
      return browser.storage.local.get('hosts')
    })
    .then((data) => data.hosts)
    .catch(print.failure_load_hosts);
}

onMount(() => {
  print.success_Dashboard_mounted();

  // browser.commands.onCommand.addListener(updateCommand);
});

const updateWorkspace = (params) => {
  return Promise.resolve(params)
    .then((_params) => _params.target)
    // .then(print.status_update_workspace_params)
    .then((_input) => ({
      key: _input.attributes.key.value,
      value: _input.type === 'checkbox' ? _input.checked : _input.value
    }))
    // .then(print.status_update_workspace)
    .then((changed) => {
      stores.config.update((_config) => {
        _config.hosts.local[changed.key] = changed.value;
        return _config;
      })
    })
    // TODO persist workspaceConfig
    .catch(print.failure_update_workspace)
}

let configFields = ['logs.level', 'notifyLevel', 'hosts']
let listFields = ['journal', 'todo', 'activePlaylist', 'playlistHistory', 'recentlySaved']

</script>

<section class="title">
  <h3>Workspace Config</h3>
  {#each Object.entries(get(stores.config)) as entry (entry[0])}
    <div>
      <h4>{entry[0]}</h4>
      {#if typeof entry[1] === 'string'}
      STRING: {entry[1]}
      {:else if entry[1] instanceof Array}
      ARRAY: {entry[1]}
      {:else if entry[1].constructor == Object}
      OBJECT: {entry[1]}
      {/if}
    </div>
  {/each}
  <!-- <img use:profileEdit src="img/img_avatar.png" alt="Avatar" class="avatar"/> -->
  <p>
    <h3>Set Remote host</h3>
    <div>
      <!-- <ul>Add New: <input on:submit={addHost} type="text"/></ul> -->
      {#each Object.entries(workspaceConfig.hosts) as host}
        <p>{host[0]}</p>
        <hr/>
        <div>
        {#each Object.entries(host[1]) as entry}
          <p>
            <span>{entry[0]}</span>
            {#if typeof entry[1] === 'boolean'}
              <input on:change={updateWorkspace} type="checkbox" key={entry[0]} checked={entry[1]}/>
            {:else if typeof entry[1] === 'string'}
              <input on:change={updateWorkspace} type="text" key={entry[0]} value={entry[1]}/>
            {:else}
              <span>Unhandled type for ({typeof entry[1]}) {entry[1]}</span>
            {/if}
          </p>
          <!--
          {:else if entry[1] instanceof Array}
          ARRAY
          {:else if entry[1].constructor == Object}
          OBJECT
          {/if}
          <input on:change={(e) => updateWorkspace(e.detail} type="checkbox" value={host.default}/>
          <input on:change={(e) => updateWorkspace(e.detail} type="text" value={host.name}/>
          <input on:change={(e) => updateWorkspace(e.detail} type="text" value={host.uri}/>
          <input on:change={(e) => updateWorkspace(e.detail} type="text" value={host.search}/>
          -->
        {/each}
        </div>
      {/each}
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
