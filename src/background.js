
// import browser from "webextension-polyfill";
// import { writable, get } from 'svelte/store';
import { cmds } from "./lib/omnibox.js";
import { stores } from "./lib/stores.js";
import {
  _fetch,
  createNotifyFailure,
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
  let cmd_prefix = lastInput.split(' ');
  try {
    // reduces omnibox cmds to a flat array of all unique keywords.
    return Promise.resolve(
      [...new Set(
        Object.keys(cmds)
        .map((cmd) => cmd.split('_'))
        .flat(1)
      )]
    )
    .then((keywords) => {
      // find input keywords used, with possible cmd keywords.
      let keys = intersection(cmd_prefix, keywords);
      // return the command name for a given bag of keywords
      return Object.values(cmds).filter((cmd) => cmd.content.includes(keys.join('_')));
    })
    .catch(print.failure);
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
    // ex1: find promise all
    // ex2: find superstonk | gather > new window
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
    // result 2 is like
    // [["find", "sq"], "|", ["gather"], ">", ["new", "window"]]
    .then((parts) => {
      // add info about tokens (lex)
      return parts.map((section) => {
        if (section.length > 0) {// && section[0].length > 0) {
          return {
            command: section[0],
            args: section.slice(1)
          };
        } else {
          return {
            command: null,
            args: section
          };
        }
      });
    })
    .then((parts) => {
      // build AST
      let tree = [];
      let node = {};
      for (let part of parts) {
        // console.log("--", part, parts);
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
    .then((tree) => {
      // clean up AST based on grammar rules
      // 1. do commands pipe together
      // 2. does each node have a left and right
      // 3. are we discovering
      // console.log("TREE", tree);
      return tree;
    })
    .then(async (_tree) => {
      // eval AST and transform into actions
      return {
        tree: await findNeighborCommands(_tree[0].left.command),
        args: _tree[0].left.args
      }
    })
    .catch(print.failure);
}

const omniboxOnInputChanged = async (text, addSuggestions) => {
  lastInput = text;
  try {
    return Promise.resolve(lastInput)
      .then(buildAST)
      // .then(print.hi_mom)
      .then((ast) => {
        console.log("[INSPECT]", ast.tree.length, ast.tree[0].length);
        return ast;
      })
      .then((ast) => {
        if (ast.tree.length >= 1 && ast.tree[0].length >= 1) {
          let cmd = ast.tree[0];
          console.log("ast tree:", cmd);
          if (cmd.suggestions) {
            let tmp = cmd.suggestions(ast.args); // FIXME args
            console.log("suggestions:", tmp);
            return tmp;
          } else {
            return cmd;
          }
        }
        return []
      })
      .then(addSuggestions)
      .catch(print.failure);
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

const omniboxOnInputEntered = (input, disposition) => {
  console.log("INPUT SUBMITTED", lastInput, input, cmds[input]);

  // return Promise.resolve(currentTheme)
  //   .then(setOmniboxTheme)
  //   .catch(print.failure)
    return Promise.resolve(input)
      .then(buildAST)
      .then((ast) => {
        console.log("[ENTERED]", ast, ast.tree);
        // console.log("[ENTERED]", tree, args, cmd);
        return [ast, Promise.resolve(ast.args).then(ast.tree[0].action).catch(print.failure)];
      })
      .then(print.success)
      .catch(print.failure);
};

const omniboxOnInputCancelled = () => {
  // Promise.resolve(currentTheme).then(setOmniboxTheme).catch(print.failure);
}


try {
  console.log('background.js mounted');

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
