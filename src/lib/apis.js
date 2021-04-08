// 2nd order

import { writable, get } from 'svelte/store';

import { clockFormatter, dateStringFromDate } from "./clock.js";
import { stores } from "./stores.js";

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

  let response = await fetch(_url, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  return handleResponse(response);
}

// -- ensemble / client / api functions

export const fileList = async (params) => {
  let data = await _fetch("/api/file/search", params);
  stores.files.update(n => ({...n, ...data, dirty: false }));

  console.log("updated filelist", data, params);
};

let dbURIs = {
  profile: "/api/db/profile",
};

export const sendProfileUpdate = async (tableName, val) => {
  let values = Object.values(val);
  let columns = Object.keys(values[0]);
  let row_data = values.map((x) => Object.values(x));
  let params = [{
    table_name: tableName,
    columns: columns.slice(0,4),
    rows: row_data.map((x) => x.slice(0,4))
  }];

  for (let row in row_data) {
    if (row.at) {
      let at_set = row.at.map((x) => x[0] );
      let rows_set = at_set.map( x => ({
        action_id: row.id,
        session_id: val.session_id,
        at: x
      }));
      params.push({
        table_name: 'log',
        columns: ['action_id', 'session_id', 'at'],
        row_data: row_set
      });
    }
  }

  console.log("SENDING UPDATE", tableName, val, params);
  let data = await _send(dbURIs.profile, params);

  console.log("updated remote log", val, params, data);
  return data;
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

export const selectedFile = (item) => item ? item['locations'][0].split('/Volumes/ARCHIVE/')[1] : "";
export const selectedFilePath = (item) => `/api/load?filepath=${selectedFile(item)}`;

export function openFile(e) {
  console.log('open file', e);
  let data = e.detail;
  return _openFile(data);
};

export function _openFile(data) {
  let target;

  if (["md", "txt", "json"].indexOf(data['file.ext']) != -1) {
    target = "panel-editor";
  }
  else if (data['file.ext'] === "pdf") {
    target = "panel-pdf";
  }
  else if (["jpg", "gif", "png"].indexOf(data['file.ext']) != -1) {
    target = "panel-gallery";
  }

  if (target !== undefined) {
    let options = {
      target_name: target,
      props: {
        data: selectedFilePath(data)
      }
    };
    console.log("data for open file", options);

    // stores.history.update(n => [...(n || []), data]);

    // TODO take a step back here. this is potentially circular with add() and
    // should be rolled into its own find/add/remove/toggle system for specific
    // content types. so we dont double open a window, but also CAN open two windows
    // of the same kind.
    stores.layoutItems.update( n => {
      n.add.push([target, options]);
      n.dirty = true;
      return n;
    });
  }
}


export function _updateLog(val) {
  // console.log("_UPDATE LOG", val);
  const date = dateStringFromDate(new Date());
  const fmtDate = clockFormatter.format(new Date());
  // warning: this could get bloated
  let _event = { ...val, at: [] };
  stores.log.update((n) => {
    let name = _event.name;
    if (name && !n[name]) {
      n[name] = _event;
    }
    n[name].at.push([Math.floor(Date.now() / 1000), date, fmtDate]);
    return n;
  });
}
export function updateLog(e) {
  // console.log("UPDATE LOG", e);
  let val = e.detail;
  _updateLog(val);
}

export function _updateHistory(val) {
  // console.log("_UPDATE HISTORY", val);
  const date = dateStringFromDate(new Date());
  const fmtDate = clockFormatter.format(new Date());
  // warning: this could get bloated
  let _event = { ...val, at: [date, fmtDate] };
  stores.history.update((n) => [...(n || []), _event]);
}
export function updateHistory(e) {
  // console.log("UPDATE HISTORY", e);
  let val = e.detail;
  _updateHistory(val);
}


export function updateFiletype(e) {
  let typeName = e.detail.name;
  _updateFiletype(typeName);
};
export function _updateFiletype(typeName) {
  if (!typeName) return;

  stores.files.update((obj) => {
    obj.filetype = typeName;
    return obj;
  });
};

// -- subscriptions

stores.layoutItems.subscribe(val => {
  console.log("[update] stores.layoutItems update", val)
});

stores.files.subscribe(val => {
  console.log("[update] stores.files update", val);
  /*
  OPTIONS:
  - cache and load different data for api calls and params

  */
  if (val && val !== "undefined" && val.dirty) {
    // FIXME this could have a race condition buried
    fileList((({ files, dirty, ...rest }) => rest)(val));
  }
});

stores.workspace.subscribe((val) => {
  console.log("[update] stores.workspace update", val);
  //JSON.parse(localStorage.getItem(item));
});

stores.log.subscribe((val) => {
  console.log("[update] stores.log update", val, Object.keys(val).length);
  if (val && Object.keys(val).length > 0) {
    sendProfileUpdate('action', val);
  }
});


stores.history.subscribe((val) => {
  console.log("[update] stores.history update", val);
  /*
  OPTIONS:
  - store to json
  - apply to event queues
  - use as local updates for registered actions or events
  */
});

stores.profile.subscribe((val) => {
  console.log("[update] stores.profile update", val);
  /*
  OPTIONS:
  - sync with remote.
  - handle login/logout user switching, export, saves, validations, etc.
  */
});

stores.actions.subscribe((val) => {
  console.log("[update] registeredActions update", val);
  /*
  OPTIONS:
  - build lists of subscribers for events/updates
  -
  */
});

