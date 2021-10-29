
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

const findCommands = (text) => {
  console.log("finding commands for:", text);
  var cmdset = resolve(text.replace(" ", "."), cmds);
  if (cmdset !== undefined) { // branch found
    if (cmdset.suggestions !== undefined) {
      return cmdset.suggestions(text);
    }
    if (cmdset.action !== undefined) { // leaf node
      return [cmdset];
    }
    // TODO make a trie of descending keys
    return Object.values(cmdset);
  }
  return [];
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

const omniboxOnInputStarted = async () => {
  console.log("User has started interacting with me.");
  lastInput = "";
};

const omniboxOnInputChanged = async (text, addSuggestions) => {
  lastInput = text;
  let result = findCommands(lastInput);
  if (result.length > 0) {
    console.log("ADDING SUGGESTIONS:", result);
    prevSuggestions = result;
    addSuggestions(result);
  } else {
    addSuggestions(prevSuggestions);
  }
};

const omniboxOnInputEntered = (url, disposition) => {
  let _text = lastInput.replace(" ", ".");
  console.log("INPUT SUBMITTED", url.replace(" ", "."), _text, disposition);
  let cmd_func = resolve(_text, cmds);
  if (cmd_func === undefined) {
    console.log("FAILED INPUT, no value for:", url, _text);
  }
  console.log("RUNNING INPUT", _text, url, cmd_func);
  let response = cmd_func.action(_text);
  console.log("RAN", response, '--', cmd_func.content, cmd_func.description);
};

try {
  console.log('background.js mounted');

  browser.runtime.onMessage.addListener(handleMessage);

  browser.tabs.onUpdated.addListener(updateTab, {
    properties: ["audible"], // , "hidden", "mutedInfo", "url"
    // tabId: tabId
  });

  browser.omnibox.setDefaultSuggestion({
    description: "this is a limited eLOS preview"
  });

  browser.omnibox.onInputStarted.addListener(omniboxOnInputStarted);
  browser.omnibox.onInputChanged.addListener(omniboxOnInputChanged);
  browser.omnibox.onInputEntered.addListener(omniboxOnInputEntered);
} catch (e) {
  console.log("Caught background.js init error", e);
};
