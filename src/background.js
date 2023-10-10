// import browser from "webextension-polyfill";
import { writable, get } from "svelte/store";
import { setContext, getContext } from "svelte";
import * as network from "./lib/apis/network.js";

import * as proxy from "./lib/apis/proxy.js";
import * as theme from "./lib/apis/theme.js";
import { cmds } from "./lib/omnibox.js";
import { stores } from "./lib/stores.js";

console.log("LOADING ELOS CONNECT - background.js");

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
  // TODO setup message handling and routing here
  if (message.action === "set.readerMode") {
    // Toggle Reader Mode
    return Promise.resolve(message)
      .then(browser.readerMode.toggleReaderMode)
      .then((_) => ({ active: true, currentWindow: true }))
      .then(browser.tabs.query)
      .then((_tabs) => _tabs[0].id)
      .then((tabId) =>
        browser.tabs.sendMessage(tabId, { action: "set.readerMode" })
      )
      .catch(proxy.print.failure_set_readermode);
  } else if (message.action === "processMarkdown") {
    return Promise.resolve(message)
      .then((msg) => msg.markdown)
      .then((mkdown) => ({
        body: mkdown,
      }))
      .then(network._send)
      .catch(proxy.print.failure_process_markdown);
  }
};

export const updateTab = (tabId, changeInfo, tab) => {
  // putting this here because the func sig is for a event handler callback
  return Promise.resolve(tab)
    .then((_tab) => ({
      name: tab.id,
      tabId: tab.id,
      windowId: tab.windowId,
      muted: tab.mutedInfo.muted,
      title: tab.title,
      url: tab.url,
      playing: tab.audible,
      article: tab.isArticle,
      changed: changeInfo,
    }))
    .then(browser.runtime.sendMessage)
    .then(proxy.print.success_update_tab)
    .catch(proxy.print.failure_update_tab);
};

// ------ COMMAND SEARCH

let lastInput = ""; // hack cache to move the whole input to the actuation
let prevSuggestions = [];

export const renderSuggestions = (_cmds) => {
  return (
    Promise.resolve(_cmds)
      // .then((tree) => tree.filter((cmdList, node) => cmdList, {}))
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
      .then((suggestions) => {
        return suggestions.reduce((result, item) => {
          let _content = item.content;
          if (_content) {
            result.push({
              content: _content,
              description: item.description,
            });
          }
          const entryKeys = ["content", "description", "action", "suggestions"];
          Object.entries(item).forEach((_entry) => {
            if (entryKeys.indexOf(_entry[0]) != -1) {
              return;
            }
            result.push({
              content: _entry[1].content,
              description: _entry[1].description,
            });
          });
          return result;
        }, []);
      })
      .catch(proxy.print.failure_render_suggestions)
  );
};

const materialzeCommandPaths = (_cmds) => {
  return Promise.resolve(_cmds).then((_cmds) => Object.entities(_cmds));
};

const findCommands = (_input) => {
  let parts = _input.toLowerCase().split(" ");
  let cursor = cmds;
  let args = null;
  parts.forEach((part, idx) => {
    let _cursor = cursor[part];
    if (_cursor) {
      cursor = _cursor;
    } else if (!args) {
      args = idx; // grab the slice at args, not just the part
    }
    // console.log("[CHANGED] cursor:", cursor, args);
  });
  args = args ? parts.slice(args) : null;
  // console.log("[END] cursor:", cursor, args);
  return [cursor, args];
};

const omniboxOnInputChanged = (text, addSuggestions) => {
  // console.log("CHANGED", lastInput, ", BECAME:", text);
  lastInput = text;
  if (lastInput && lastInput.length == 0) {
  }

  try {
    return Promise.resolve(lastInput)
      .then(findCommands)
      .then(renderSuggestions)
      .then(addSuggestions)
      .catch(proxy.print.failure_omnibox_changed);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const omniboxOnInputStarted = (params) => {
  console.log("User has started interacting with me.", params);
  lastInput = "";
};

export const registerHistory = (event) => {
  return Promise.resolve(event)
    .then(proxy.print.status_register_history)
    .then((_event) => {
      return (n) => [
        ...n,
        {
          event: _event,
          timestamp: new Date(),
        },
      ];
    })
    .then(stores.actionHistory.update)
    .catch(proxy.print.failure_register_history);
};

export const renderAction = (_input) => {
  return (
    Promise.resolve(_input)
      .then(findCommands)
      // FIXME if _input is partial (like "syn", down arrow, enter)
      //       then check if results are OKAY,
      //       else process from input, not lastInput
      .then(proxy.print.status_render_action)
      .then((_cmds) => _cmds[0].action(_cmds[1]))
      .catch(proxy.print.failure_render_action)
  );
};

const omniboxOnInputEntered = (input, disposition) => {
  // console.log("INPUT SUBMITTED", lastInput, '--', input, '--', cmds[input]);
  return Promise.resolve(lastInput)
    .then(proxy.print.status_on_input_entered)
    // .then(registerHistory)
    .then(renderAction)
    .then(proxy.print.success_on_input_entered)
    .catch(proxy.print.failure_omnibox_entered);
};

const omniboxOnInputCancelled = () => {
  theme.resetOmnibox();
};

// ------ websocket to server --- In background.js

// // Connect to the websocket
// const socket = new WebSocket('ws://localhost:5000/ws');

// // Add a context menu item
// browser.contextMenus.create({
//   id: 'process-link',
//   title: 'Process link',
//   contexts: ['link'],
// });

// // Add an event listener for when the context menu item is clicked
// browser.contextMenus.onClicked.addListener((info, tab) => {
//   if (info.menuItemId === 'process-link') {
//     // Send the link over the websocket
//     socket.send(JSON.stringify({
//       action: 'process_link',
//       link: info.linkUrl,
//     }));
//   }
// });

// -------------------

const commandAction = (name) => {
  return Promise.resolve(name)
    .then(renderAction)
    .then(proxy.print.success_command_action)
    .catch(proxy.print.failure_command_action);
};

// --------

class CommandContextMenu {
  constructor(command) {
    this.command = command;
  }

  onClick(info, tab) {
    this.command.action();
  }

  create() {
    return {
      id: this.command.content,
      title: this.command.content,
      contexts: ["browser_action"],
      onclick: this.onClick,
    };
  }
}

class CommandsContextMenu {
  constructor(commands) {
    this.commands = commands;
  }

  create() {
    return Object.values(this.commands).map((command) =>
      new CommandContextMenu(command).create()
    );
  }
}

// ----

try {
  proxy.print.success_background_js_mounted();

  // let params = {
  //   name: `sidebar-${browser.windows.getCurrent().id}`,
  //   debug: true,
  //   handler: (args) => console.log("[HANDLER][MESSAGE][RECEIVE]", args),
  // };
  // params.postMessage = setupRelay(params);

  // GENERAL MESSAGE HANDLER
  browser.runtime.onMessage.addListener(handleMessage);

  // WATCH FOR PROPERTY CHANGES
  browser.tabs.onUpdated.addListener(updateTab, {
    properties: ["audible"], // , "hidden", "mutedInfo", "url"
    // tabId: tabId
  });

  // OMNIBOX START
  browser.omnibox.setDefaultSuggestion({
    description: "this is a limited eLOS preview; v0.0.11-prealpha",
  });

  browser.omnibox.onInputStarted.addListener(omniboxOnInputStarted);
  browser.omnibox.onInputChanged.addListener(omniboxOnInputChanged);
  browser.omnibox.onInputEntered.addListener(omniboxOnInputEntered);
  browser.omnibox.onInputCancelled.addListener(omniboxOnInputCancelled);

  // browser.runtime.onInstalled.addListener(setThemeContext);
  browser.commands.onCommand.addListener(commandAction);
  // browser.runtime.onSuspend.addListener(omniboxOnInputCancelled);

  // OMNIBOX END

  // // CONTEXT MENUS
  // browser.contextMenus.create({
  //   id: "root",
  //   title: "WebExtension Commands",
  //   contexts: ["browser_action"],
  // });

  // const contextMenus = new CommandsContextMenu(cmds);
  // contextMenus.create().forEach((menu) => {
  //   browser.contextMenus.create(menu);
  // });
} catch (e) {
  console.log("Caught background.js init error", e);
}
