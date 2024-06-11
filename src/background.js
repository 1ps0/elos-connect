// import browser from "webextension-polyfill";
import { writable } from 'svelte/store';
import * as network from './lib/apis/network.js';

import * as proxy from './lib/apis/proxy.js';
import * as theme from './lib/apis/theme.js';
import { cmds } from './lib/omnibox.js';
// import { stores } from './lib/stores.js';

console.log('LOADING ELOS CONNECT - background.js');

// ------ GLOBAL ERRORS

$: {
  if (browser.runtime.lastError) {
    let err = browser.runtime.lastError;
    Promise.resolve({
        title: `browser.runtime lastError: ${err.name}`,
        message: err.message,
        // buttons: ['retry', 'close']
      })
      .then(proxy.notify.received_global_errors)
      .catch(proxy.print.failure_global_errors);
  }
}

// ------ MESSAGING

// const handleMessage = (request, sender, sendResponse) => {
const handleMessage = (message) => {
  proxy.print.status_background_got_message(message);
  if (message.action === 'set.readerMode') {
    // Toggle Reader Mode
    return Promise.resolve(message)
      .then(browser.readerMode.toggleReaderMode)
      .then((_) => ({ active: true, currentWindow: true }))
      .then(browser.tabs.query)
      .then((_tabs) => _tabs[0].id)
      .then((tabId) =>
        browser.tabs.sendMessage(tabId, { action: 'set.readerMode' })
      )
      .catch(proxy.print.failure_set_readermode);
  } else if (message.action === 'processMarkdown') {
    return Promise.resolve(message)
      .then((msg) => msg.markdown)
      .then((mkdown) => ({
        body: mkdown,
      }))
      .then(network._send)
      .catch(proxy.print.failure_process_markdown);
  }
};

// --- PlayingTabs Listener Handler

const playingTabs = {};

const updatePlayingTabs = (_, changeInfo, tab) => {
  return Promise.resolve(tab)
    .then(_tab => {
      if (changeInfo.audible !== undefined) {
        if (!playingTabs[_tab.tabId]) {
          playingTabs[_tab.tabId] = {
            tabId: _tab.tabId,
            title: _tab.title,
            url: _tab.url,
            isPlaying: _tab.audible
          };
        } else {
          playingTabs[_tab.tabId].isPlaying = _tab.audible;
        }
      }
    })
    .then(proxy.print.status_update_playing_tabs)
    .catch(proxy.print.failure_update_playing_tabs)
}


const removeTabFromPlaying = (tabId) => {
  return Promise.resolve(tabId)
    .then(_tabId => {
      if (playingTabs[tabId]) {
        delete playingTabs[tabId];
      }
    })
    .then(proxy.print.status_remove_tab_from_playing)
    .catch(proxy.print.failure_remove_tab_from_playing)
};

// Function to scan all tabs and update playingTabs
const scanAllTabs = () => {
  return browser.tabs.query({ audible: true})
    .then(_tabs => {
      _tabs.forEach((tab) => {
        playingTabs[tab.id] = {
          tabId: tab.id,
          windowId: tab.windowId,
          title: tab.title,
          url: tab.url,
          isPlaying: tab.audible
        };
      });
      return playingTabs;
    })
    .then(proxy.print.status_scan_all_tabs)
    .catch(proxy.print.failure_scan_all_tabs)
};

// ------ COMMAND SEARCH

let lastInput = ''; // hack cache to move the whole input to the actuation
let prevSuggestions = [];

export const renderPlayingTabs = () => {
  return Promise.resolve(playingTabs)
    .then(Object.values)
    .then(_tabs => _tabs.map(tab => {
      return {
        content: 'playing '+tab.tabId+' '+tab.windowId,
        description: `${tab.isPlaying ? '🔊' : '🔇'} ${tab.title}`
      }
    }))
    .then(proxy.print.status_render_playing_tabs)
    .catch(proxy.print.failure_render_playing_tabs);
};

export const renderSuggestions = (_cmds) => {
  return (
    Promise.resolve(_cmds)
      .then((cmd) => {
        let tree = cmd[0];
        let args = cmd[1];
        if (tree.suggestions) {
          return tree.suggestions(args);
        } else if (
          Array.isArray(tree) &&
          tree.length > 0 &&
          tree[0].suggestions
        ) {
          return tree[0].suggestions(args);
        } else if (Array.isArray(tree)) {
          return tree;
        } else {
          return [tree].flat(1);
        }
      })
      .then(_suggs => Promise.all(_suggs))
      .then(_suggs => {
        return _suggs.reduce((result, item) => {
          result.push({
            content: 'playing '+item.tabId+' '+item.windowId,
            description: item.title,
          });
          return result;
        }, []);
      })
      .catch(proxy.print.failure_render_suggestions)
  );
};

const findCommands = (_input) => {
  return Promise.resolve(_input)
    .then(value => value.toLowerCase())
    .then(value => value.split(' '))
    .then(parts => {
      let cursor = cmds;
      let args = null;
      parts.forEach((part, idx) => {
        let _cursor = cursor[part];
        if (_cursor) {
          cursor = _cursor;
        } else if (!args) {
          args = idx;
        }
      });
      args = args ? parts.slice(args) : null;
      return [cursor, args]
    })
    .catch(proxy.print.failure_background_find_commands);
};

const omniboxOnInputChanged = (text, addSuggestions) => {
  lastInput = text;

  try {
    return Promise.resolve(lastInput)
      .then(_input => {
        if (_input.toLowerCase() === 'playing history') {
          return renderPlayingTabs();
        } else {
          return findCommands(_input)
            .then(renderSuggestions);
        }
      })
      .then(addSuggestions)
      .catch(proxy.print.failure_omnibox_changed);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const omniboxOnInputStarted = (params) => {
  console.log('User has started interacting with me.', params);
  lastInput = '';
};

export const renderAction = (_input) => {
  return (
    Promise.resolve(_input)
      .then(findCommands)
      .then(proxy.print.status_render_action)
      .then((_cmds) => _cmds[0].action(_cmds[1]))
      .catch(proxy.print.failure_render_action)
  );
};

export const renderPrevSuggestion = (_input) => {
  return Promise.resolve(_input)
    .then(proxy.print.status_input_prev_suggestions)
    .then(_input => {
      return prevSuggestions.find(_val => {
        _val.content == _input
      });
    })
    .then(proxy.print.status_prev_suggestions)
    .catch(proxy.print.failure_prev_suggestion);
}


const omniboxOnInputEntered = (_input, _disposition) => {
  // proxy.print.status_input_entered_input(_input)
  return (
    Promise.resolve(_input)
      // .then(renderAction)
      .then(findCommands)
      .then(proxy.print.status_on_input_entered)
      .then((_cmds) => _cmds[0].action(_cmds[1]))
      .catch(proxy.print.failure_omnibox_entered)
  );
};

const omniboxOnInputCancelled = () => {
  theme.resetOmnibox();
};

// -------------------

const createContextMenu = () => {
  return new Promise((resolve, reject) => {
    browser.contextMenus.create({
      id: 'unloadTab',
      title: 'Unload Tab',
      contexts: ['tab']
    }, () => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

const handleContextMenuClick = (info, tab) => {
  return Promise.resolve({ info: info, tabId: tab.id })
    .then(_info => {
      if (info.menuItemId === 'unloadTab') {
        browser.tabs.discard(tab.id);
      }
    })
    .catch(proxy.print.failure_handle_context_menu_click);
};


// ----

try {
  proxy.print.success_background_js_mounted();

  browser.tabs.onUpdated.addListener(updatePlayingTabs, { properties: ["audible"] });
  browser.tabs.onRemoved.addListener(removeTabFromPlaying);  
  scanAllTabs();

  
  // GENERAL MESSAGE HANDLER
  browser.runtime.onMessage.addListener(handleMessage);

  // OMNIBOX START
  browser.omnibox.setDefaultSuggestion({
    description: '--',
  });

  browser.omnibox.onInputStarted.addListener(omniboxOnInputStarted);
  browser.omnibox.onInputChanged.addListener(omniboxOnInputChanged);
  browser.omnibox.onInputEntered.addListener(omniboxOnInputEntered);
  browser.omnibox.onInputCancelled.addListener(omniboxOnInputCancelled);

  // browser.runtime.onInstalled.addListener(setThemeContext);
  // browser.commands.onCommand.addListener(commandAction);
  // browser.runtime.onSuspend.addListener(omniboxOnInputCancelled);

  browser.contextMenus.onClicked.addListener(handleContextMenuClick);
  createContextMenu();

} catch (e) {
  console.log('Caught background.js init error', e);
}
