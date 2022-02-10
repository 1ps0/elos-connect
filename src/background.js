
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
  const result = new Set();
  const _sA = new Set(sA);
  for (let elem of sB) {
    if (_sA.has(elem)) {
      result.add(elem);
    }
  }
  return [...result];
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
const setOmniboxTheme = (params) => {
  // windows.WINDOW_ID_CURRENT
  return [params, browser.theme.update(params)];
};

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
        changed: changeInfo
      }
  ).then(print.success)
  .catch(print.failure);
}

// ------ COMMAND SEARCH

let lastInput = ""; // hack cache to move the whole input to the actuation
let prevSuggestions = [];

const findNeighborCommands = (node) => {
  // https://stackoverflow.com/questions/57026895/get-unique-values-from-array-of-arrays
  let cmd_prefix = (node && node.length > 0 ? node[0].left.command : lastInput).split(' ');
  try {
    // reduces omnibox cmds to a flat array of all unique keywords.
    return Promise.resolve(
      [...new Set(
        Object.keys(cmds)
        .map((cmd) => cmd.split('_'))
        .flat(1)
      )]
    )
    .then((keywords) => intersection(cmd_prefix, keywords))
    .then((keys) => {
      // find input keywords used, with possible cmd keywords.
      // let keys = intersection(cmd_prefix, keywords);
      // return the command name for a given bag of keywords
      return Object.values(cmds).filter((cmd) => cmd.content.includes(keys.join('_')));
    })
    // .then(print.status_neighbor_keywords)
    .catch(print.failure_find_neighbor_commands);
  }
  catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

export const buildAST = (_input) => {
  // return _input; // until function is implemented

  // supports | and >
  // where | is normal pipe operation in unix
  // where > is unix-like output into a target
  return Promise.resolve(_input)
    // TODO: find superstonk | gather > new window
    .then((_input) => _input.trim().split("|"))
    .then((parts) => {
      // break into parts (tokenize), simple linear tokenizer
      return parts.map((part) => {
        return part.trim()
          .split(" ")
          .map((token) => {
            return token.trim()
              // .split(":")
              // .map((_token) => _token.trim())
          });
      });
    })
    // ["stash", "window"]
    // TODO: [["find", "sq"], "|", ["gather"], ">", ["new", "window"]]
    .then((parts) => {
      return parts.map((section) => {
        if (section.length > 0) {// && section[0].length > 0) {
          return {
            command: section[0],
            args: section.slice(1)
          };
        } else {
          // TODO replace with '|' or '>' operations across cmds
          return {
            command: null,
            args: section
          };
        }
      });
    })
    .then((parts) => { // build AST
      let tree = [];
      let node = {};
      for (let part of parts) {
        if (!part.command) { //(part === "|" || part === ">") {
          node.op = part;
        } else if (!node.left) {
          node.left = part;
        } else if (!node.right) {
          node.right = part;
        }

        // hack for left-only case
        if (node.left) {
          tree.push(node);
          node = {};
        }
      }
      return tree;
    })
    // .then((_tree) => _tree[0])
    .catch(print.failure_build_ast);
}

export const renderSuggestions = (ast) => {
  if (ast.tree && ast.tree.length > 3) {
    return ast.tree;
  }
  return Promise.all((ast.tree ? ast.tree : [])
    .map((node) => {
      if (node.suggestions) {
        console.log("SUGGESTIONS", ast, ast.args);
        return node.suggestions(ast.args).catch(print.failure_suggestions);
      } else {
        return node;
      }
    }))
    .then((results) => results.flat(1))
    .catch(print.failure_render_suggestions);
}

const omniboxOnInputChanged = async (text, addSuggestions) => {
  console.log("CHANGED", lastInput, ", BECAME:", text);
  lastInput = text;
  try {
    return Promise.resolve(lastInput)
      .then(buildAST)
      .then(renderSuggestions)
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

  // return Promise.resolve(
  //   currentTheme ?
  //   currentTheme : browser.theme.getCurrent()
  // )
  // .then(createOmniboxActivationTheme)
  // .then((params) => {
  //   currentTheme = browser.theme.getCurrent();
  //   return params;
  // })
  // .then(setOmniboxTheme)
  // .catch(print.failure);
};

export const renderAction = (ast) => {
  console.log("[ENTERED]", ast);

  return Promise.resolve(ast)
    .then(findNeighborCommands)
    .then((neighbors) => ({
      tree: neighbors,
      args: ast.args ? ast.args : []
    }))
    .then((_ast) => _ast.tree[0].action(_ast.args))
    // .then(print.success_render_action)
    .catch(print.failure_render_action);
}

const omniboxOnInputEntered = (input, disposition) => {
  console.log("INPUT SUBMITTED", lastInput, '--', input, '--', cmds[input]);

  // return Promise.resolve(currentTheme)
  //   .then(setOmniboxTheme)
  //   .catch(print.failure)

    return Promise.resolve(lastInput)
      .then(buildAST)
      .then(renderAction)
      .then(print.success_on_input_entered)
      .catch(print.failure_omnibox_entered);
};

const omniboxOnInputCancelled = () => {
  // Promise.resolve(currentTheme).then(setOmniboxTheme).catch(print.failure);
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

  // browser.omnibox.setDefaultSuggestion({
  //   description: "this is a limited eLOS preview; v0.0.6-prealpha"
  // });

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
