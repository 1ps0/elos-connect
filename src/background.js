
import { onMount } from 'svelte';

// import browser from "webextension-polyfill";
// import { writable, get } from 'svelte/store';
import { _fetch } from "./lib/apis.js";

console.log("LOADING ELOS CONNECT - background.js");

const parseComponents = (text) => {
  let params = {};
  text.split(' ').forEach(part => {
    let param = part.split(":");
    if (param.length > 1) {
      params[param[0]] = param[1]
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
    var r = {tag: node.nodeName}, a, i;
    if (node.childElementCount) {
        r.children = [];
        for (i = 0; a = node.children[i]; i++) {
            r.children.push(getTree(a));
        }
    }
    for (i = 0; a = node.attributes[i]; i++) {
        r[a.nodeName] = a.nodeValue;
    }
    return r;
}

// var links = document.querySelectorAll('a');
// console.log(getTree(links[0])); // only pass the first node to the function

const htmlToJson = (div) => {
 var tag = {}
 tag['tagName'] = div.tagName
 tag['children'] = []
 for(var i = 0; i < div.children.length; i++){
    tag['children'].push(htmlToJson(div.children[i]));
 }
 for(var i = 0; i < div.attributes.length;i++) {
    var attr = div.attributes[i];
    tag['_'+attr.name] = attr.value;
 }
 return tag;
}

const resolve = (path, obj=self, separator='.') => {
    var properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
}


// onMount(async () => {
console.log('background.js mounted');

browser.omnibox.setDefaultSuggestion({
  description: `Search eLOS location database: \
    search [tag | title | url]: <value:str>)`
});

browser.omnibox.onInputChanged.addListener(async (text, addSuggestions) => {
  console.log("parsing", text);
  let params = parseComponents(text);
  console.log("SHOW SUGGESTIONS", params);
  let data = null;
  if (params.length === 0) {
    data = [];
  } else {
    data = await _fetch("/api/location/search", params);
  }
  console.log("-- got search data", params, data);
  // stores.links.subscribe((e) => {});
  addSuggestions(createSuggestionsFromResponse(data));
});

browser.omnibox.onInputEntered.addListener((url, disposition) => {
  console.log("INPUT SUBMITTED", url, disposition);
  let parts = url.split(':')
  if (parts[0].indexOf('file') > -1) {
    //
  }
  switch (disposition) {
    case "currentTab":
      browser.tabs.update({url});
      break;
    case "newForegroundTab":
      browser.tabs.create({url});
      break;
    case "newBackgroundTab":
      browser.tabs.create({url, active: false});
      break;
  }
  // linkList(params)
  // if ("search" in parts) {
  //   let _cmds = cmds.search;
  //   console.log('SEARCHING', parts, _cmds);
  //   for (part in parts) {
  //     if (part in Object.keys(_cmds)) {
  //       if ()

  //     }
  //   }

  // }
  // });
});
