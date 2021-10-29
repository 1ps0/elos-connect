// 2nd order

import { writable, get } from 'svelte/store';

import { clockFormatter, dateStringFromDate } from "./clock.js";
import { stores } from "./stores.js";
import { openWith } from "../config/open.js";

// -- reactive globals


// -- primitive functions

export const handleResponse = async (response) => {
  if (response.ok) { // if HTTP-status is 200-299
    return await response.json();
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
  let baseUrl = "http://localhost:3000";
  let _url = new URL(url, baseUrl);

  for (let arg in params) {
    _url.searchParams.append(arg, params[arg]);
  }
  let response = await fetch(_url);
  return await handleResponse(response);
};

export const _send = async (url, params={}) => {
  /*
  OPTIONS:
  - replace base url with env var or other
  - add POST option for sending to same domain.
  */
  let baseUrl = "http://localhost:3000";
  let _url = new URL(url, baseUrl);

  params.method = "POST";
  console.log("fetching", _url);
  let response = await fetch(_url, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  console.log("fetched", response);
  return handleResponse(response);
}

// -- modules

// backbone of messaging system
// NOTE: will be different across contexts (?)
const ports = {};
export const addPort = (p) => {
  console.log("Adding port for tab", p.sender.tab.id, p);
  ports[p.sender.tab.id] = p;
}
export const getPorts = () => {
  return ports;
}
export const removePort = (tabId) => {
  console.log("Deleting port for tab", tabId);
  delete ports[tabId];
}


export const getCurrentActiveTab = async () => {
  return browser.tabs.query({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT
  });
};

export const getCurrentHighlightedTabs = async () => {
  return browser.tabs.query({
    highlighted: true,
    windowId: browser.windows.WINDOW_ID_CURRENT
  });
};

export const updateCurrentWindow = async (params) => {
  return browser.windows.update(
    browser.windows.WINDOW_ID_CURRENT,
    params
  );
};

export const createRuntimeConnection = async (params) => {
  return browser.runtime.connect({
    connectInfo: {
      name: params.name
    }
  });
};

export const sendRuntimeMessage = async (params) => {
  return browser.runtime.postMessage(params);
};

export const sendToContentScript = async (params) => {
  return window.postMessage({
    direction: params.direction,
    message: params.message
  }, "*");
}

export const setPinnedTab = async (params) => {
  return getCurrentHighlightedTabs().then( (tabs) => {
    for (const tab of tabs) {
      browser.tabs.update(tab.id, { pinned: true });
    }
  });
};

// export const _ = async (params) => {};


export const sendMessageToTabs = (tabs) => {
  for (let tab of tabs) {
    browser.tabs.sendMessage(
      tab.id,
      {greeting: "Hi from background script"}
    ).then(response => {
      console.log("Message from the content script:");
      console.log(response.response);
    }).catch(printFailure);
  }
};

export const getBrowserInfo = async () => {
  return browser.runtime.getBrowserInfo().then((_b) => {
    return {
      name: _b.name,
      version: _b.version
    }
  });
};

export const reduceAudibleTabs = (tabs) => {
  console.log("rendering audible:", tabs);
  return tabs.map((tab) => {
    return {
      name: tab.id,
      tabId: tab.id,
      windowId: tab.windowId,
      muted: tab.mutedInfo.muted,
      playing: tab.audible,
      title: tab.title,
      url: tab.url,
    };
  });
};

export const addRuntimeMessageHook = async (params) => {
  return browser.runtime.onMessage.addListener(params.hook);
};

export const createNotify = async (params) => {
  return browser.notifications.create({
    type: "basic",
    title: params.title,
    message: params.message,
    buttons: params.buttons || []
  });
};


export const createNotifySuccess = async (params) => {
  console.log("[SUCCESS][NOTIFIED]", params);
  return createNotify({
    title: "Success!",
    message: "!"+params
  })
}

export const createNotifyError = async (params) => {
  console.log("[FAILURE][NOTIFIED]", params);
  return createNotify({
    title: "Error",
    message: ":"+params
  })
}

export const printSuccess = (result) => {
  console.log("[SUCCESS]", result);
  return result;
};

export const printFailure = (err) => {
  console.log("[FAILURE]", err);
  return err;
};

// -- ensemble / client / api functions



export const fileList = async (params) => {
  _fetch("/api/file/search", params).then( (data) => {
    stores.files.update(n => ({...n, ...data, dirty: false }));
    console.log("updated filelist", data, params);
  }).catch ((err) => {
    console.log("failed to update filelist", err, params);
  })

};

let dbURIs = {
  profile: "/api/db/profile",
};

export const linkList = async (params) => {
  // # keywords = request.args.get("keywords", "")
  // # tags = request.args.get("tags", [])
  // # order = request.args.get("order", "DESC")
  // limit = request.args.get("limit", 10)
  // offset = request.args.get("offset", 0)
  let data = await _fetch("/api/location/search", params);
  stores.links.update(n => ({...n, ...data, dirty: false}));
  console.log("updated linklist", data, params);
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
    if (row.at.length > 0) { // what if row.at doesnt exist or isnt an array?
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

  if (["md", "txt", "json", "py", "js"].indexOf(data['file.ext']) != -1) {
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
        data: selectedFilePath(data),
        language: data['file.ext'] || 'markdown',
        theme: 'vs-light',
        features: ['wordWrap',]
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


export function updateLocation(e) {
  let typeName = e.detail.name;
  if (!typeName) return;

  stores.links.update((obj) => {
    obj.filetype = typeName;
    return obj;
  });
};

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
  // if (val && Object.keys(val).length > 0) {
  //   sendProfileUpdate('action', val);
  // }
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

