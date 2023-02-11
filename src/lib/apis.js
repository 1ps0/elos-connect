// 2nd order

import { get } from 'svelte/store';
import { stores } from "./stores.js";
import { print, notify, register } from "./apis/proxy.js";
import * as reduce from "./apis/reduce.js";

// -- apis/*.js joined here
// TODO trim
import * as bookmarks from "./apis/bookmarks.js";
import * as files from "./apis/files.js";
import * as network from "./network.js";
import * as send from "./send.js";
import * as tabs from "./apis/tabs.js";
import * as windows from "./apis/windows.js";


// FIXME remove when fully depreciating this file.
export { print, notify, register };


// attempt to fix the DataCloneError error,
// where sendMessage of some kind includes
// methods in an object, so they need to be pruned
export const pruneMethods = (value) => {
  return Promise.resolve(value)
    .then(JSON.stringify)
    .then(JSON.parse)
    .catch(print.failure_stores_prune_methods);
}


// ------- Storage

export const getBrowserInfo = async () => {
  return browser.runtime.getBrowserInfo()
  .then((_b) => {
    return {
      name: _b.name,
      version: _b.version
    }
  })
  .catch(print.failure_get_browser_info);
};



export const checkKeymap = (params) => {};
export const updateKeymap = (params) => {};
export const undoKeymap = (params) => {};

// -- ensemble / client / api functions

// -- filters

export const findMatches = (options, searchTerm) =>
  options.filter(option => {
    const foundIndex = option.toLowerCase().indexOf(
      searchTerm.toLowerCase()
    )

    return foundIndex > -1
  })

export const spanWrapSearchTerm = (option, foundIndex, searchTermLength) => {
  const searchTerm = option.slice(foundIndex, foundIndex + searchTermLength)

  return `<span>${searchTerm}</span>`
}

export const boldSearchTerm = (option, searchTerm) => {
  const lowercaseOption = option.toLowerCase()
  const lowercaseSearchTerm = searchTerm.toLowerCase()
  let foundIndex = lowercaseOption.indexOf(lowercaseSearchTerm)
  let html = ''

  if (!searchTerm) return option

  while (foundIndex !== -1) {
    const previousIndex = foundIndex
    const searchTermLength = searchTerm.length

    if (!html) {
      html = option.slice(0, foundIndex)
    }

    html += spanWrapSearchTerm(option, foundIndex, searchTermLength)

    // check for another match
    foundIndex = lowercaseOption.indexOf(lowercaseSearchTerm, foundIndex + 1)

    if (foundIndex !== -1) {
      // second match: add raw string before next section of html
      html += option.slice(previousIndex + searchTermLength, foundIndex)
    } else {
      // single match, finish the string
      html += option.slice(previousIndex + searchTermLength)
    }
  }

  return html || option
}
