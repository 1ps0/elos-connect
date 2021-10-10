
import { onMount } from 'svelte';

// import browser from "webextension-polyfill";
// import { writable, get } from 'svelte/store';
import { cmds } from "./lib/omnibox.js";
import { _fetch } from "./lib/apis.js";
import { commandOptionsWritable } from "./lib/stores.js";

console.log("LOADING ELOS CONNECT - background.js");


browser.runtime.onMessage.addListener(notify);

function notify(message) {
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("link.png"),
    "title": "You clicked a link!",
    "message": message.url
  });
}


// let ports = []

// function connected(p) {
//   ports[p.sender.tab.id] = p
//   //...
// }

// browser.runtime.onConnect.addListener(connected)

// browser.browserAction.onClicked.addListener(function() {
//   ports.forEach( p => {
//         p.postMessage({greeting: "they clicked the button!"})
//     })
// });


// let messenger = document.getElementById("from-page-script");

// function messageContentScript() {
//   window.postMessage({
//     direction: "from-page-script",
//     message: "Message from the page"
//   }, "*");
// }
// messenger.addEventListener("click", messageContentScript);

// commandOptionsWritable.subscribe(val => {
//   console.log("history", val.history())
// });

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

const getTree = (node) => {
    var tree = {
      ...node.attributes,
      tag: node.nodeName,
      children: node.childElementCount ? node.children.map(getTree) : [],
    };
    return tree;
}

// var links = document.querySelectorAll('a');
// console.log(getTree(links[0])); // only pass the first node to the function

const htmlToJson = (div) => {
  let tag = {
    tagName: div.tagName,
    children: div.children.map(htmlToJson)
  }
  div.attributes.forEach( attr => {
    tag['_'+attr.name] = attr.value;
  })
  return tag;
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
    if (cmdset.action !== undefined) { // leaf node
      return [cmdset];
    }
    // TODO make a trie of descending keys
    return Object.values(cmdset);
  }
  return [];
}

try {
  console.log('background.js mounted');

  browser.omnibox.setDefaultSuggestion({
    description: "this is a limited eLOS preview"
  });

  browser.omnibox.onInputStarted.addListener(async () => {
    console.log("User has started interacting with me.")
  });

  browser.omnibox.onInputChanged.addListener(async (text, addSuggestions) => {
    let params = parseComponents(text);
    let result = [];
    if (!params.local){
      result = await runSuggestions(params);
    } else {
      result = findCommands(text);
    }
    if (result) {
      console.log("ADDING SUGGESTIONS:", result);
      addSuggestions(result);
    }
  });

  browser.omnibox.onInputEntered.addListener((url, disposition) => {
    console.log("INPUT SUBMITTED", url.replace(" ", "."), disposition);
    var cmd_func = resolve(url.replace(" ", "."), cmds);
    if (cmd_func === undefined) {
      console.log("FAILED INPUT, no value for:", url);
    }
    console.log("RUNNING INPUT", url, cmd_func);
    var response = cmd_func.action();
    console.log("RAN", response, '--', cmd_func.content, cmd_func.description);
  });
} catch (e) {
  console.log("Caught background.js init error", e);
};