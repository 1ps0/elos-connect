
// import browser from "webextension-polyfill";
// import { writable, get } from 'svelte/store';
import { cmds } from "./lib/omnibox.js";
import { stores } from "./lib/stores.js";
import {
  createNotify,
  _fetch,
  printFailure,
  printSuccess
} from "./lib/apis.js";

console.log("LOADING ELOS CONNECT - background.js");

$: {
  if (browser.runtime.lastError !== null) {
    var err = browser.runtime.lastError;
    createNotify({
      title: `browser.runtime lastError: ${err.name}`,
      message: err.message
      // buttons: ['retry', 'close']
    });
    console.log("Error: ", err);
  }
};

const updateTab = (tabId, changeInfo, tab) => {
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
  ).then(printSuccess)
  .catch(printFailure)
}

/*global getAccessToken*/

const setupAuth = () => {
  /**
  When the button's clicked:
  - get an access token using the identity API
  - use it to get the user's info
  - show a notification containing some of it
  getAccessToken()
      .then(getUserInfo)
      .then(createNotify)
      .catch(printFailure);
  */
  browser.identity.getRedirectURL();
}

const createSuggestionsFromResponse = (response) => {
  console.log(response);
  let suggestions = [];
  let suggestionsOnEmptyResults = [{
    content: "about:blank",
    description: "no results found"
  }];
  if (!response || !response.status || !response.results) {
    console.log("no valid suggestions: ", response, response.status, response.results);
    return suggestionsOnEmptyResults;
  }

  response.results.forEach( obj => {
    suggestions.push({
      content: obj.uri,
      description: '['+obj.value+'] '+obj.label,
    });
  });
  console.log('suggestions',suggestions);
  return suggestions;
}

const resolve = (path, obj, separator='.') => {
  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
}

const runSuggestions = async (params) => {
  console.log("SHOW SUGGESTIONS", params);
  let data = null;
  if (params.length === 0) {
    data = [];
  } else {
    data = await _fetch("/api/location/search", params);
  }
  console.log("-- got search data", params, data);
  // stores.links.subscribe((e) => {});
  return createSuggestionsFromResponse(data);
}


const parseComponents = (text) => {
  let params = { local: true, query: text };
  text.split(' ').forEach(part => {
    let param = part.split(":");
    if (param.length > 1) {
      params[param[0]] = param[1];
      params.has_keyword = ['tag', 'title', 'url'].indexOf(params[0]) !== -1;
    }
  });
  return params;
}

const handleMessage = (request, sender, sendResponse) => {
  console.log("[background] got message", request, sender, sendResponse);
};


let lastInput = ""; // hack cache to move the whole input to the actuation
let prevSuggestions = [];

const findNeighborCommands = (text) => {
  let cmd_prefix = text.replace(' ', '_');
  let neighbors = Object.keys(cmds).filter((cmd) => cmd.includes(cmd_prefix));
  return neighbors.map((x) => x.replace('_', ' '));
};

let currentTheme = null;
const setOmniboxTheme = async (params) => {
  // windows.WINDOW_ID_CURRENT
  return [params, browser.theme.update(params)];
};

const resetOmniboxTheme = async (params) => {
  return [params, browser.theme.reset()];
}

const createOmniboxActivationTheme = async (theme) => {
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

const omniboxOnInputStarted = async () => {
  console.log("User has started interacting with me.");
  lastInput = "";
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
  .catch(printFailure);
};

const omniboxOnInputChanged = async (text, addSuggestions) => {
  lastInput = text;
  return Promise.resolve(lastInput)
    .then(findNeighborCommands)//, Promise.resolve(prevSuggestions))
    .then((neighbors) => {
      // return neighbors.filter((cmd) => cmd.suggestions !== undefined);
      return Object.entries(cmds).filter((cmd) => {
        return neighbors.includes(cmd[0].replace('_', ' '))
      });
    })
    .then((neighbors) => {
      prevSuggestions = neighbors.map((x) => x[1]);
      return prevSuggestions;
    })
    .then(printSuccess)
    .then(addSuggestions)
    .catch(printFailure)
};

const omniboxOnInputEntered = (url, disposition) => {
  console.log("INPUT SUBMITTED", lastInput, url, cmds[url]);

  Promise.resolve(currentTheme).then(setOmniboxTheme).catch(printFailure);

  return Promise.resolve(url)
    .then((cmd_key) => {
      let args = lastInput.split(cmd_key).slice(1);
      let cmd = cmds[cmd_key];
      console.log("[ENTERED]", cmd_key, args, cmd);
      return [cmd, args, cmd.action(args)];
    })
    .then(printSuccess)
    .catch(printFailure);

  // // let cmd_func = resolve(_text, cmds);
  // let cmd_func = Object.keys(cmds);

  // if (cmd_func === undefined) {
  //   console.log("FAILED INPUT, no value for:", url, _text);
  // }
  // console.log("RUNNING INPUT", _text, url, cmd_func);
  // let response = cmd_func.action(_text);
  // console.log("RAN", response, '--', cmd_func.content, cmd_func.description);
};

const omniboxOnInputCancelled = () => {
  Promise.resolve(currentTheme).then(setOmniboxTheme).catch(printFailure);
}

try {
  console.log('background.js mounted');

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
} catch (e) {
  console.log("Caught background.js init error", e);
};
