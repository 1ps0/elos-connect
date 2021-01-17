// 2nd order

import { clockFormatter, dateStringFromDate } from "./clock.js";
import { historyWritable, filesWritable, registeredActions, workspaceWritable, profileWritable } from "./stores.js";

// -- reactive globals


// -- primitive functions

export const handleResponse = async (response) => {
  if (response.ok) { // if HTTP-status is 200-299
    let data = await response.json();
    return data;
  } else {
    console.log("HTTP-Error: ", response.status);
    return null;
  }
}

export const _fetch = async (url, params={}) => {
  /*
  OPTIONS:
  - replace base url with env var or other
  - add POST option for sending to same domain.
  */
  let baseUrl = "http://localhost:8080";
  let _url = new URL(url, baseUrl);

  for (let arg in params) {
    _url.searchParams.append(arg, params[arg]);
  }

  let response = await fetch(_url);
  return handleResponse(response);
};

export const _send = async (url, params={}) => {
  /*
  OPTIONS:
  - replace base url with env var or other
  - add POST option for sending to same domain.
  */
  let baseUrl = "http://localhost:8080";
  let _url = new URL(url, baseUrl);

  params.method = "POST";

  let response = await fetch(_url, params);
  return handleResponse(response);
}

// -- ensemble / client / api functions

export const fileList = async (params) => {
  let data = await _fetch("/api/file/search", params);
  filesWritable.update(n => ({...n, ...data, dirty: false }));

  console.log("updated filelist", data, params);
};

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

// -- event callbacks


export function _updateHistory(val) {
  console.log("_UPDATE HISTORY", val);
  const date = dateStringFromDate(new Date());
  const fmtDate = clockFormatter.format(new Date());
  // warning: this could get bloated
  let event = { ...val, at: [date, fmtDate] };
  // console.log("update history with", e.detail, event);
  historyWritable.update((n) => [...(n || []), event]);
}
export function updateHistory(e) {
  console.log("UPDATE HISTORY", e);
  let val = e.detail;
  _updateHistory(val);
}


export function updateFiletype(e) {
  let typeName = e.detail.name;
  _updateFiletype(typeName);
};
export function _updateFiletype(typeName) {
  filesWritable.update((obj) => {
    obj.filetype = typeName;
    return obj;
  });
};

// -- subscriptions

filesWritable.subscribe(val => {
  console.log("[update] filesWritable update", val);
  /*
  OPTIONS:
  - cache and load different data for api calls and params

  */
  if (val && val !== "undefined" && val.dirty) {
    // FIXME this could have a race condition buried
    fileList((({ files, dirty, ...rest }) => rest)(val));
    filesWritable.update(n => ({...(n || {}), dirty: false}));
  }
});

workspaceWritable.subscribe((val) => {
  console.log("[update] workspaceWritable update", val);
  //JSON.parse(localStorage.getItem(item));
});


historyWritable.subscribe((val) => {
  console.log("[update] historyWritable update", val);
  /*
  OPTIONS:
  - store to json
  - apply to event queues
  - use as local updates for registered actions or events
  */
});

profileWritable.subscribe((val) => {
  console.log("[update] profileWritable update", val);
  /*
  OPTIONS:
  - sync with remote.
  - handle login/logout user switching, export, saves, validations, etc.
  */
});

registeredActions.subscribe((val) => {
  console.log("[update] registeredActions update", val);
  /*
  OPTIONS:
  - build lists of subscribers for events/updates
  -
  */
});

