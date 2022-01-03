// 2nd order

import { writable, get } from 'svelte/store';

import { clockFormatter, dateStringFromDate } from "./clock.js";
import { stores } from "./stores.js";
import { openWith } from "../config/open.js";

// -- reactive globals

// -- primitive functions

export const handleResponse = async (response) => {
  if (response.ok) { // if HTTP-status is 200-299
    return response.json();
  } else {
    console.log("HTTP-Error: ", response.status);
    return null;
  }
}

export const _fetch = async (params) => {
  // let baseUrl = "http://localhost:3000";
  let baseUrl = get(stores.config).baseUrl;
  return Promise.resolve(new URL(params.uri, baseUrl))
    .then((url) => {
      for (let arg in params.args) {
        url.searchParams.append(arg, params.args[arg]);
      }
      return url;
    })
    .then(fetch)
    .then(handleResponse)
    .catch(print.failure);
};

export const _send = async (params) => {
  // let baseUrl = "http://localhost:3000";
  let baseUrl = get(stores.config).baseUrl;
  return Promise.resolve(new URL(params.uri, baseUrl))
    .then((url) => {
      return {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params.body)
      }
    })
    .then(fetch)
    .then(handleResponse)
    .catch(print.failure);
}

// ------- Send composites

export const sendTag = async (params) => {
  // TODO normalize params interface and validation of values
  return Promise.resolve(params && params.tagName ? params.tagName : '#tag_name')
    .then((name) => document.querySelector(name))
    // FIXME extract css styling into module that can be integrated
    // .then((button) => {
    //   button.style.borderColor = "blue";
    //   return button;
    // })
    .then((button) => button.value)
    .then((tagName) => {
      return {
        uri: "api/analysis/tag",
        args: {
          name: tagName
        }
      }
    })
    .then(_send)
    // .then((button) => {
    //   button.style.borderColor = "green";
    //   return button;
    // })
    .catch(print.failure)
    // .then((button) => {
    //   button.style.borderColor = "red";
    //   return button;
    // });
}

export const sendLink = async (tagName) => {
  return browser.tabs.query({
    currentWindow: true, active: true
  })
  .then((tabs) => {
    return {
      uri: "api/location/add",
      body: {
        label: tabs[0].title,
        uri: tabs[0].url,
        tag: tagName
      }
    }
  })
  .then(_send)
  .then(createNotifySuccess)
  .catch(print.failure)
}

export const sendSidebar = async (params) => {
  // params is { tabId: 0, windowId: 0 } only
  // neither gives global table, both gives rejection
  return browser.sidebarAction.getPanel()//params)
    .then((panel) => {
      // browser.sidbarAction.open()
    })
    .catch(print.failure);
}

export const getContexts = (results) => {
  console.log("sending results", results);
  return Promise.all(results)
  .then((_results) => {
    return _results.map((result) => {
      console.log("sending to context", result);
      return browser.tabs.sendMessage(result.tabId, {
        ranges: result.rangeData
      })
    })
  })
}

// -------- Find composites

export const findInTab = (query, tabId) => {
  return browser.find.find(query, {
      tabId: tabId,
      includeRangeData: true,
      // includeRectData: true
    }) // TODO set timeout to filter slow promises. currently none
    // .then(print.status)
    .catch((err) => console.log("Err:", tabId, query, err))
    .finally((result) => {
      return {
        count: 0, // overwritten by result if not failcase
        ...result,
        tabId: tabId
      }
    })
}

export const findInAll = async (params) => {
  // TODO add soft 'limit' on 'all tabs' count.
  return getAllTabs(params)
    .then((_params) => {
      return _params.map((tab) => {
        return findInTab(params, tab.id);
      })
    })
    .then((_params) => {
      return _params.filter((result) => (result && result.count > 0));
    })
    // .then(print.status)
    .then(getContexts)
    .then((results) => {
      return results.map(async (result) => {
        return {
          content: ` -- ${params}`, //${result.text.slice(0,10)}
          description: await result.then(print.success).catch(print.failure),
        }
      });
    })
    // .then(print.success)
    // .catch(print.failure);
}

// ---------- Load composites

export const loadTags = async () => {
  return Promise.resolve({ uri:'api/analysis/tag'})
    .then(_fetch)
    .then((results) => results.names.map((tag) => tag[1]))
    .catch(print.failure);
};

export const loadSites = async () => {
  return browser.topSites.get()
    .then((sites) => {
      return sites;
    })
    .then((sites) => {
      return sites.map((site) => ({
        title: site.title,
        url: site.url
      }));
    })
    .then((sites) => {
      return {
        elementId: 'item-list',
        sites: sites,
      }
    })
    .catch(print.failure);
}

export const loadSessions = async () => {
  return browser.sessions.getRecentlyClosed()
    .then((sessions) => {
      return sessions.map((session) => ({

      }))
    })
    .then(print.success)
    .catch(print.failure);
}

export const loadVisits = async (params) => {
  return browser.history.getVisits(params)
    .catch(print.failure);
}

export const loadHistory = async (params) => {
  // params can only be { url: string }
  return browser.history.search({
      text: params && params.query ? params.query : "",
      startTime: params && params.startTime ? params.startTime : 0, // default 24h window
      // maxResults: params && params.resultCount ? params.resultCount :
    })
    .then((historyItems) => {
      return historyItems.map((item) => ({
        id: item.id,
        url: item.url,
        title: item.title,
        lastVisitTime: item.lastVisitTime, // page was last loaded, in milliseconds since the epoch.
        visitCount: item.visitCount, // has visited the page.
        typedCount: item.typedCount // navigated to this page by typing in the address.
      }));
    })
    .catch(print.failure);
}

export const loadCommands = async (params) => {
  return browser.commands.getAll()
    .then((cmds) => {
      return cmds.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        shortcut: cmd.shortcut
      }))
    })
    .catch(print.failure);
}

// ---------- Actions

export const restoreSession = async (_sessions) => {
  return Promise.resolve(_sessions)
    .then((sessions) => {
      if (!sessions || !sessions.length) {
        return [];
      }
      return sessions;
    })
    .then((sessions) => {
      sessions.forEach((session) => {
        if (session.tab) {
          browser.sessions.restore(session.tab.sessionId);
        } else {
          browser.sessions.restore(session.window.sessionId);
        }
      })
      return sessions;
    })
    .catch(print.failure);
}

// -- messaging

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
};

export const createRuntimeConnection = async (params) => {
  return browser.runtime.connect({
    connectInfo: {
      name: params.name
    }
  });
};

// export const sendRuntimeMessage = async (params) => {
//   return browser.runtime.sendMessage(params)
//     .catch(print.failure);
// };

export const sendTabMessage = async (params) => {
  return browser.tabs.sendMessage(params.tabId)
    .catch(print.failure);
};

export const sendMessageToTabs = async (tabs) => {
  return Promise.all(tabs.map((tab) => {
    return browser.tabs.sendMessage(
      tab.id,
      {greeting: "Hi from background script"}
    ).then(response => {
      console.log("Message from the content script:");
      console.log(response.response);
    }).catch(print.failure);
  }));
};

export const addRuntimeMessageHook = async (params) => {
  return browser.runtime.onMessage.addListener(params.hook);
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

// ------- WINDOW FUNCTIONS

// "window_update_move_topright"
export const window_update_move_topright = () => {
  browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
    left: 0,
    top: 0
  });
};

// "window-update-size_768"
export const window_update_size_768 = () => {
  browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
    width: 768,
    height: 1024
  });
}

// "window-update-minimize"
export const window_update = () => {
  browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
    state: "minimized",
  });
}

// "window-create-detached-panel"
export const window_create = () => {
  browser.windows.create({
    // type: "popup",
    type: "detached_panel",
    incognito: true,
  }).then(() => {
    console.log("The detached panel has been created");
  }).catch(print.failure);
}

// "window-remove"
export const window_stash = () => {
  //
  browser.tabs.query({
    highlighted: true,
    // active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT
  })
  .then((tabs) => {
    return tabs.length > 0 ? tabs : browser.windows.getAll();
  })
  .then((tabs) => {
    console.log('doing selected copy:', windows.WINDOW_ID_CURRENT, tabs);
    // return tabs.map((x) => x.title+","+x.url).join('\n');
    return tabs
  })
  .then((tabs) => {
    return tabs.map((tab) => {
      return {
        "uri": tab.url,
        "label": tab.title,
        "tag": "stash"
      }
    })
  })
  .then(() => {
    browser.windows.remove(windows.WINDOW_ID_CURRENT);
  })
  .catch(print.failure);
}

// "window-resize-all"
export const window_resize_all = () => {
  browser.windows.getAll().then((windows) => {
    for (var item of windows) {
      browser.windows.update(item.id, {
        width: 1024,
        height: 768
      });
    }
  }).catch(print.failure);
}

// "window-preface-title"
export const window_preface_title = () => {
  browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
    titlePreface: "Preface | "
  }).catch(print.failure);
};


export const hasWindowId = (data) => {
  console.log("checking has window id", data);
  if (data.windowId !== undefined) {
    return data;
  } else {
    Promise.reject("windowId not in", data);
  }
};
export const setWindowActive = (data) => {
  console.log("Setting active window with data", data);
  let status = browser.windows.update(data.windowId, { focused: true });
  if (status) { return data; }
  else { return Promise.reject("Failed to update tab", data); }
}


// --- tab ops
// NOTE: all 'get' types dont have a catch failure by design

export const getAllTabs = async () => {
  return browser.tabs.query({})
    .then((tabs) => {
      return tabs.filter((tab) => tab != tabs.TAB_ID_NONE);
    })
    // .catch(print.failure)
}

export const getCurrentActiveTab = async () => {
  return browser.tabs.query({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT
  })
  // .catch(print.failure);
};

export const hasTabId = (data) => {
  console.log("checking has tab id", data);
  if (data.tabId !== undefined) {
    return data;
  } else {
    Promise.reject("tabId not in", data);
  }
};

export const setTabActive = (data) => {
  console.log("Setting active tab with data", data);
  let status = browser.tabs.update(data.tabId, { active: true });
  if (status) { return data; }
  else { return Promise.reject("Failed to update tab", data); }
};

export const sendToContent = (params) => {
  console.log("[BG][->][CONTENT]", params.tabId, params.message);
  return Promise.resolve(params)
    .then((data) => browser.tabs.sendMessage(data.tabId, data.message))
    .then(createNotifySuccess)
    .catch(print.failure);
}


export const updateClipboard = (newClip) => {
  return navigator.clipboard.writeText(newClip)
    .then(createNotifySuccess)
    .catch(createNotifyFailure);
};

export const getHighlightedTabs = (newClip) => {
  return browser.tabs.query({
      highlighted: true,
      // active: true,
      windowId: browser.windows.WINDOW_ID_CURRENT
    })
    .then((tabs) => tabs.map((tab) => ({
      title: tab.title,
      url: tab.url,
      tabId: tab.id,
      windowId: tab.windowId,
    })))
    .catch(print.failure);
}

export const doSelectedCopy = async (e) => {
  return getHighlightedTabs()
    .then((tabs) => {
      console.log('doing selected copy:', browser.windows.WINDOW_ID_CURRENT, tabs);
      return tabs.map((tab) => `${tab.title},${tab.url}`).join('\n');
    })
    .then(updateClipboard)
    .then(createNotifySuccess)
    .catch(print.failure);
}

export const doDownloadVideo = (params) => {
  return getCurrentActiveTab()
    .then((tab) => ({
      uri: "api/action/download/video",
      body: {
        uri: tab[0].url,
      }
    }))
    .then(_send)
    .then(createNotifySuccess)
    .catch(print.failure);
}

export const bringToFront = (e) => {
  return Promise.resolve(e)
    // .then(tabIdFromdata)
    // .then(hasTabId, print.failure)
    .then(setTabActive)
    // .then(hasWindowId, print.failure)
    .then(setWindowActive)
    .then(print.success)
    .catch(print.failure);
}

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


export const setPinnedTab = async (params) => {
  return getCurrentHighlightedTabs().then( (tabs) => {
    for (const tab of tabs) {
      browser.tabs.update(tab.id, { pinned: true });
    }
  });
};

export const getBrowserInfo = async () => {
  return browser.runtime.getBrowserInfo().then((_b) => {
    return {
      name: _b.name,
      version: _b.version
    }
  });
};

// --- browser impl

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
      .catch(print.failure);
  */
  browser.identity.getRedirectURL();
}



// -- render functions

export const walkNodes = (walker) => {
  let nodes = [];
  while(node = walker.nextNode()) {
    nodes.push([node.name, node.data]);
  }
  return nodes;
}

export const reduceDocumentText = () => {
  return Promise.resolve(
    document.createTreeWalker(
      document,
      window.NodeFilter.SHOW_TEXT,
      null,
      false
    )
  )
  .then(walkNodes)

  .then(print.success)
  .catch(print.failure)
}

export const reduceAudibleTabs = (tabs) => {
  // console.log("rendering audible:", tabs);
  return tabs.map((tab) => {
    return {
      name: tab.id,
      tabId: tab.id,
      windowId: tab.windowId,
      muted: tab.mutedInfo.muted,
      playing: tab.audible,
      status: tab.audible,
      title: tab.title,
      url: tab.url,
    };
  });
};

// -- content processing

export const reducePage = async (params) => {

};

export const sendPage = async (params) => {
  return Promise.resolve(params.data)
    .then((tab) => {
      if (tab.isInReaderMode) {}
      else {
        browser.tabs.toggleReaderMode();
      }
      return data;
    })
    .catch(print.failure);
};

// -- feedback via print or notify

export const createNotify = async (params) => {
  return browser.notifications.create({
    type: "basic",
    title: params.title,
    message: params.message,
    // buttons: params.buttons || []
  }).catch(print.failure);
};


export const createNotifySuccess = async (params) => {
  console.log("[SUCCESS][NOTIFIED]", params);
  return createNotify({
    title: "Success!",
    message: `For ${params.title}`
  })
}

export const createNotifyFailure = async (params) => {
  console.log("[FAILURE][NOTIFIED]", params);
  return createNotify({
    title: "Error",
    message: `For ${params.title}`
  })
}

export const print = new Proxy(() => {}, {
  // TODO return as universal print object,
  // like, `print.failure`, `print.success`,
  // `print.per_is_article`, `print.hi_mom`
  get(target, name) {
    return (args) => {
      console.log(`[PRINT][${name.toUpperCase()}]`, args);
      return args;
    }
  }
});

export const printStatus = (params) => {
  console.log("[LOG][STATUS]", params);
  return params;
}

export const printSuccess = (result) => {
  console.log("[SUCCESS]", result);
  return result;
};

export const printFailure = (err) => {
  console.log("[FAILURE]", err);
  return err;
};

export const setStore = async (params) => {
  return stores[params.name];
};


export const checkKeymap = async (params) => {};
export const updateKeymap = async (params) => {};
export const undoKeymap = async (params) => {};
// export const _ = async (params) => {};
// export const _ = async (params) => {};

// -- ensemble / client / api functions



export const fileList = async (params) => {
  // _fetch("/api/file/search", params).then( (data) => {
  //   stores.files.update(n => ({...n, ...data, dirty: false }));
  //   console.log("updated filelist", data, params);
  // }).catch ((err) => {
  //   console.log("failed to update filelist", err, params);
  // })
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
  // if (!typeName) return;

  // stores.files.update((obj) => {
  //   obj.filetype = typeName;
  //   return obj;
  // });
};

// -- subscriptions

stores.layoutItems.subscribe(val => {
  console.log("[update] stores.layoutItems update", val)
});

stores.files.subscribe(val => {
  console.log("[update] stores.files update", val);
  // /*
  // OPTIONS:
  // - cache and load different data for api calls and params

  // */
  // if (val && val !== "undefined" && val.dirty) {
  //   // FIXME this could have a race condition buried
  //   fileList((({ files, dirty, ...rest }) => rest)(val));
  // }
});

stores.config.subscribe((val) => {
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

