
// import browser from "webextension-polyfill";
// import { writable, get } from 'svelte/store';
import { cmds } from "./lib/omnibox.js";
import { stores } from "./lib/stores.js";
import {
  _fetch,
  createNotifyFailure,
  setupRelay,
  print
} from "./lib/apis.js";

console.log("LOADING ELOS CONNECT - background.js");

// ------ GLOBAL ERRORS

$: {
  if (browser.runtime.lastError !== null) {
    var err = browser.runtime.lastError;
    Promise.resolve({
      title: `browser.runtime lastError: ${err.name}`,
      message: err.message
      // buttons: ['retry', 'close']
    })
    .then(createNotifyFailure)
    .catch(print.failure);
  }
};


// ------ HANDLERS

export const resolve = (path, obj, separator='.') => {
  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
}

export const intersection = (sA, sB) => {
  return Promise.resolve(sA)
    .then((_sA) => new Set([_sA].flat(1)))
    .then(print.status_intersection_sA)
    .then((_sA) => {
      const result = new Set();
      for (let elem of sB) {
        if (_sA.has(elem)) {
          console.log("[INTERSECTION]", elem)
          result.add(elem);
        }
      }
      console.log("[DONE]", result)
      return [...result];
    })
    .catch(print.failure_intersection);
};


export const union = (sA, sB) => {
  const _keys = new Set(sA);
  for (let elem of sB) {
    _keys.add(elem);
  }
  return [..._keys];
};


// ------ THEME

let currentTheme = null;
const _setOmniboxTheme = (params) => {
  // windows.WINDOW_ID_CURRENT
  return [params, browser.theme.update(params)];
};

const setOmniboxTheme = () => {
  Promise.resolve(currentTheme)
    .then(setOmniboxTheme)
    .catch(print.failure_reset_omnibox_theme);
}

const resetOmniboxTheme = (params) => {
  return [params, browser.theme.reset()];
}

const createOmniboxActivationTheme = (theme) => {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      toolbar_field: "black",
      toolbar_field_text: "gray",
      toolbar_field_highlight: "green",
      toolbar_field_focus: "black",
      toolbar_field_text_focus: "white",
    }
  };
};

const restoreCurrentTheme = () => {
  return Promise.resolve(
    currentTheme ?
    currentTheme : browser.theme.getCurrent()
  )
  .then(createOmniboxActivationTheme)
  .then((params) => {
    currentTheme = browser.theme.getCurrent();
    return params;
  })
  .then(setOmniboxTheme)
  .catch(print.failure_restore_current_theme);
}


// ------ MESSAGING

const handleMessage = (request, sender, sendResponse) => {
  console.log("[background] got message", request, sender, sendResponse);
  // TODO setup message handling and routing here
};

export const updateTab = (tabId, changeInfo, tab) => {
  console.log("GOT TAB UPDATE", tabId, changeInfo, tab);
    return browser.runtime.sendMessage(
      {
        name: tab.id,
        tabId: tab.id,
        windowId: tab.windowId,
        muted: tab.mutedInfo.muted,
        title: tab.title,
        url: tab.url,
        playing: tab.audible,
        article: tab.isArticle,
        changed: changeInfo
      }
    )
    .then(print.success_update_tab)
    .catch(print.failure_update_tab);
}

// ------ COMMAND SEARCH

let lastInput = ""; // hack cache to move the whole input to the actuation
let prevSuggestions = [];

export const renderSuggestions = (_cmds) => {
  return Promise.resolve(_cmds)
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
          console.log("FORMAT ITEM", item, result,);
          result.push({
            content: _content,
            description: item.description,
          });
        }
        const entryKeys = ['content','description','action','suggestions'];
        Object.entries(item).forEach((_entry) => {
          if (entryKeys.indexOf(_entry[0]) != -1) {
            return
          }
          console.log("FORMAT ENTRY", _entry, result,);
          result.push({
            content: _entry[1].content,
            description: _entry[1].description
          })
        })
        return result;
      }, []);
    })
    .catch(print.failure_render_suggestions);
}

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

const omniboxOnInputChanged = async (text, addSuggestions) => {
  // console.log("CHANGED", lastInput, ", BECAME:", text);
  lastInput = text;
  try {
    return Promise.resolve(lastInput)
      .then(findCommands)
      .then(renderSuggestions)
      // .then(print.status_render_suggestions)
      .then(addSuggestions)
      .catch(print.failure_omnibox_changed);
  }
  catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const omniboxOnInputStarted = async () => {
  console.log("User has started interacting with me.");
  lastInput = "";
  return;
};

export const registerHistory = (event) => {
  // passthrough
  stores.history.update((n) => [...n, event])
    .catch(print.failure_register_history);
  return event;
};

export const renderAction = (_input) => {
  return Promise.resolve(_input)
    .then(findCommands)
    .then(print.status_render_action)
    .then((_cmds) => _cmds[0].action(_cmds[1]))
    .catch(print.failure_render_action);
}

const omniboxOnInputEntered = (input, disposition) => {
  console.log("INPUT SUBMITTED", lastInput, '--', input, '--', cmds[input]);
  return Promise.resolve(lastInput)
    .then(renderAction)
    // .then(print.success_on_input_entered)
    .catch(print.failure_omnibox_entered);
};

const omniboxOnInputCancelled = () => {
  resetOmniboxTheme();
}


try {
  console.log('background.js mounted');

  // let params = {
  //   name: `sidebar-${browser.windows.getCurrent().id}`,
  //   debug: true,
  //   handler: (args) => console.log("[HANDLER][MESSAGE][RECEIVE]", args),
  // };
  // params.postMessage = setupRelay(params);

  browser.runtime.onMessage.addListener(handleMessage);

  browser.tabs.onUpdated.addListener(updateTab, {
    properties: ["audible"], // , "hidden", "mutedInfo", "url"
    // tabId: tabId
  });

  browser.omnibox.setDefaultSuggestion({
    description: "this is a limited eLOS preview; v0.0.6-prealpha"
  });

  browser.omnibox.onInputStarted.addListener(omniboxOnInputStarted);
  browser.omnibox.onInputChanged.addListener(omniboxOnInputChanged);
  browser.omnibox.onInputEntered.addListener(omniboxOnInputEntered);
  browser.omnibox.onInputCancelled.addListener(omniboxOnInputCancelled);

  browser.runtime.onInstalled.addListener(() => {
    currentTheme = browser.theme.getCurrent();
    // return Promise.resolve(details)
    //   .then(print.success)
    //   .catch(print.failure);
  });

  // browser.runtime.onSuspend.addListener(omniboxOnInputCancelled);

} catch (e) {
  console.log("Caught background.js init error", e);
};
