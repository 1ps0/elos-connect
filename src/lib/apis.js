// 2nd order

import { clockFormatter, dateStringFromDate } from "./clock.js";
import { historyWritable, filesWritable, registeredActions, workspaceWritable, profileWritable } from "./stores.js";

// -- reactive globals

export let selectedFile = "";
export let selectedFilePath = null;
$: selectedFilePath = `/api/load?filepath=${selectedFile}`;


// -- primitive functions

export const handleResponse = async (response) => {
  if (response.ok) { // if HTTP-status is 200-299
    let json = await response.json();
    return json;
  } else {
    console.log("HTTP-Error: ", _url, response.status);
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

// -- event callbacks

export function updateHistory(e) {
  let val = e.detail;
  _updateHistory(val);
}

export function _updateHistory(val) {
  let event = {
    // warning: this could get bloated
    data:{
      ...val,
      timer: timer,
      at: (dateStringFromDate(new Date()), clockFormatter.format(new Date()))
    }
  };
  console.log("update history with", e.detail, event);
  historyWritable.update((n) => [
    ...n,
    ...[event]
  ]);
}

export function updateFiletype(e) {
  let typeName = e.detail.name;
  _updateFiletype(typeName);
};

export function _updateFiletype(typeName) {
  filesWritable.update((obj) => ({
    ...obj,
    metadata: {
      ...obj.metadata,
      filetype: typeName
    }
  }));
};

// -- subscriptions

filesWritable.subscribe(val => {
  console.log("[init] filesWritable update", val);
  /*
  OPTIONS:
  - cache and load different data for api calls and params

  */
  if (val.dirty) {
    // FIXME this could have a race condition buried
    fileList((({ files, dirty, ...rest }) => rest)(val));
    filesWritable.update(n => ({...n, dirty: false}));
  }
});

workspaceWritable.subscribe((val) => {
  console.log("[init] workspaceWritable update", val);
  localStorage.setItem('workspace', JSON.stringify(val));
  //JSON.parse(localStorage.getItem(item));
});


historyWritable.subscribe((val) => {
  console.log("[init] historyWritable update", val);
  /*
  OPTIONS:
  - store to json
  - apply to event queues
  - use as local updates for registered actions or events
  */
});

profileWritable.subscribe((val) => {
  console.log("update for profileWritable", val);
  /*
  OPTIONS:
  - sync with remote.
  - handle login/logout user switching, export, saves, validations, etc.
  */
});

registeredActions.subscribe((val) => {
  console.log("update for registeredActions", val);
  /*
  OPTIONS:
  - build lists of subscribers for events/updates
  -
  */
});

