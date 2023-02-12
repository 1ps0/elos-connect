// 2nd order

import { get } from 'svelte/store';
import { stores } from "./stores.js";
import { print, notify, register } from "./apis/proxy.js";

// -- apis/*.js joined here

// FIXME remove when fully depreciating this file.
export { print, notify, register };

import * as reduce from "./apis/reduce.js";

// -- apis/*.js joined here
// TODO trim
import * as bookmarks from "./apis/bookmarks.js";
import * as files from "./apis/files.js";
import * as network from "./network.js";
import * as send from "./send.js";
import * as tabs from "./apis/tabs.js";
import * as windows from "./apis/windows.js";

// attempt to fix the DataCloneError error,
// where sendMessage of some kind includes
// methods in an object, so they need to be pruned
export const pruneMethods = (value) => {
  return Promise.resolve(value)
    .then(JSON.stringify)
    .then(JSON.parse)
    .catch(print.failure_stores_prune_methods);
}

// TODO window right / laft / full args

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
  let baseUrl = get(stores.config).hosts.local.uri;
  return Promise.resolve(new URL(params.uri, baseUrl))
    .then((url) => {
      for (let arg in params.args) {
        url.searchParams.append(arg, params.args[arg]);
      }
      return url;
    })
    .then(fetch)
    .then(handleResponse)
    .then(register.success_last_message)
    .catch(print.failure_fetch);
};

export const _send = async (params) => {
  // let baseUrl = "http://localhost:3000";
  let baseUrl = get(stores.config).hosts.local.uri;
  return Promise.resolve(new URL(params.uri, baseUrl))
    .then((url) => {
      return {
        url: url,
        method: "POST",
        credentials: "omit",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params.body)
      }
    })
    .then((args) => fetch(args.url, args))
    .then(handleResponse)
    .then(register.success_last_message)
    .catch(print.failure_send);
}

// -- system

export const doUnloadTabs = (params) => {
  return Promise.resolve(params)
    .then(browser.tabs.discard)
    .catch(print.failure_unload_tabs)
}

export const doReloadSystem = (params) => {
  return browser.runtime.reload()
    .catch(print.failure_do_reload_system);
}

// ------- Send composites

export const sendTag = async (params) => {
  // TODO normalize params interface and validation of values
  return Promise.resolve(params && params.tagName ? params.tagName : '#tag_name')
    .then((name) => document.querySelector(name))
    // FIXME extract css styling into module that can be integrated
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
    .catch(print.failure_send_tag)
}

export const sendLink = async (tagName) => {
  return getCurrentActiveTab()
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
  .then(notify.success)
  .catch(print.failure_send_link)
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
          ...result,
          message: "find"
        }).catch(print.failure_send_message_context)
      })
    })
    .catch(print.failure_get_contexts);
}

// -------- Find composites

export const findInTab = (query, tabId) => {
  return browser.find.find(query.join(' '), {
      tabId: tabId,
      includeRangeData: true,
      // includeRectData: true
    }) // TODO set timeout to filter slow promises. currently none
    .then((results) => {
      return {
        tabId: tabId,
        count: results.count,
        rangeData: results.rangeData
      }
    })
    .catch(print.failure_find_in_tab)
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
      return Promise.all(_params.map((tab) => {
        return findInTab(params, tab.id);
      }))
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
    .catch(print.failure_find_in_all);
}

// ---------- Load composites

export const loadTags = async () => {
  return Promise.resolve({ uri:'api/analysis/tag'})
    .then(_fetch)
    .then((results) => results.names.map((tag) => tag[1]))
    .catch(print.failure_load_tabs);
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
    .catch(print.failure_load_sites);
}

export const loadSessions = async () => {
  return browser.sessions.getRecentlyClosed()
    .then((sessions) => {
      return sessions.map((session) => ({

      }))
    })
    .then(print.success)
    .catch(print.failure_load_sessions);
}

export const loadVisits = async (params) => {
  return browser.history.getVisits(params)
    .catch(print.failure_load_visits);
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
    .catch(print.failure_load_history);
}

// web_accessible_resources
// browser.extension.getURL("beasts/frog.jpg");

export const loadCommands = (params) => {
  return browser.commands.getAll()
    .then((cmds) => {
      return cmds.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        shortcut: cmd.shortcut
      }))
    })
    .catch(print.failure_load_commands);
}
/*
    "MediaNextTrack"
    "MediaPlayPause"
    "MediaPrevTrack"
    "MediaStop"
*/
export const setupCommands = (params) => {
  browser.commands.onCommand.addListener(function (command) {
    if (command === "toggle-feature") {
      console.log("Toggling the feature!");
    }
  });

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
          browser.sessions.restore(session.tab.sessionId)
            .catch(print.failure_restore_tab);
        } else {
          browser.sessions.restore(session.window.sessionId)
            .catch(print.failure_restore_window);
        }
      })
      return sessions;
    })
    .catch(print.failure_restore_session);
}


export const moveTabs = async (tabs, _window) => {
  console.log("MOVE TAB", tabs, _window);
  return browser.tabs.move((await tabs), {
      index: -1, // param reverse: 0 to reverse, -1 to stay same
      windowId: _window.id
    })
    .catch(print.failure_move_tab)
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

export const registerContentScript = (hosts) => {
  return Promise.resolve({
      matches: ["<all_urls>"],
      js: [{file: "build/content_inject.js"}],
      runAt: "document_idle"
    })
    .then(browser.contentScripts.register)
    .catch(print.failure_content_scripts_register);
}

const relayRegistry = {};
export const setupRelay = (params) => {
  // TODO lazy capture incoming ports from external sources:
  // external sources: sidebar, page content.

  // getPorts
  // TODO add 'args' which let you include select keys too
  const ports = () => {
    return Promise.resolve(relayRegistry)
      .then(Object.values)
      .then((values) => values.map((relay) => relay.port))
      .then(Array.from)
      .catch(print.failure_get_ports)
  }

  const handleMessage = (args) => {
    console.log("[RELAY][MESSAGE][RECEIVE]", args, params.debug ? params : '');
    if (params.handler) {
      params.handler(args);
    }
  }
  const postMessage = (args) => {
    let _postData = relayRegistry[params.name];
    console.log("[RELAY][MESSAGE][SEND]", args, params.debug ? params : '');
    if (args.action === "disconnect") {
      postData.port.disconnect(); // should trigger a callback disconnecting the rest
    }
    return _postData.port.postMessage(args)
  }
  const initRelay = (name) => {
    const port = browser.runtime.connect({ name: name });
    port.onMessage.addListener((args) => {
      return Promise.resolve(args)
        .then(handleMessage)
        .catch(print.failure_port_message)
    });
    return port;
  };
  // addPort
  browser.runtime.onConnect.addListener((args) => {
    console.log("[RELAY][CONNECT][NEW]", args);
    let _port = initRelay(args);
    args.name = args.name ? args.name : params.name // TODO add random gen etag type
    relayRegistry[args.name] = {
      ...params,
      ...args,
      port: _port
    };
  });
  // removePort
  browser.runtime.onDisconnect.addListener((params) => {
    if (!params.name) {
      console.log("[RELAY][DISCONNECT][FAILURE]", "No field 'name'", params)
    }
    let _connection = relayRegistry[params.name];
    _connection.port.disconnect(); // can be used to validate a mutual disconnection
    relayRegistry[params.name] = null;
  })
  console.log("[RELAY][INIT]", params);
  return postMessage; // everything else is internally handled
}

// export const sendRuntimeMessage = async (params) => {
//   return browser.runtime.sendMessage(params)
//     .catch(print.failure);
// };

export const sendTabMessage = async (params) => {
  return browser.tabs.sendMessage(params.tabId)
    .catch(print.failure_send_tab_message);
};

export const sendMessageToTabs = async (tabs) => {
  return Promise.all(tabs.map((tab) => {
    return browser.tabs.sendMessage(
      tab.id,
      {greeting: "Hi from background script"}
    )
    .then(print.status_send_message_to_tabs_response)
    .catch(print.failure_send_message_to_tabs_response)
  }))
}

export const addRuntimeMessageHook = async (params) => {
  return browser.runtime.onMessage.addListener(params.hook);
};

export const sendRuntimeMessage = async (params) => {
  return Promise.resolve(params)
    .then(pruneMethods)
    .then(browser.runtime.postMessage)
    .catch(print.failure_send_runtime_message);
};

export const sendToContentScript = async (params) => {
  return Promise.resolve(params)
    .then((_params) => ({
      direction: _params.direction,
      message: _params.message
    }))
    .then((args) => window.postMessage(args, "*"))
    .catch(print.failure_send_to_content_script);
}

// ------- WINDOW FUNCTIONS

export const createWindow = (args) => {
  return Promise.resolve(args ? args : {
    // type: "popup",
    type: "detached_panel",
    incognito: true,
  })
  .then(browser.windows.create)
  .catch(print.failure_window_create);
}

export const setWindowTitle = (data) => {
  return Promise.resolve({
      titlePreface: (data && data.length ? `${data[0]} | ` : "Preface | ")
    })
    .then((preface) => {
      return browser.windows.update(
        browser.windows.WINDOW_ID_CURRENT,
        preface
      )
    })
    .catch(print.failure_set_window_title);
};

const addActiveWindowId = (data) => {
  return browser.windows.getCurrent()
    .then((_window) => ({
      ...data,
      windowId: _window.id
    }))
    .catch(print.failure_add_active_window_id)
}
const addActiveTabId = (data) => {
  return browser.tabs.query({ active: true })
    .then((tabs) => ({
      ...data,
      tabId: tabs[0].id
    }))
    .catch(print.failure_add_active_tab_id)
}

const enrichItem = (item) => {
  return Promise.resolve(item)
    // .then(addActiveWindowId)
    // .then(addActiveTabId)
    .catch(print.failure_enrich_item);
}


export const setTabActive = (data) => {
  console.log("Setting active tab with data", data);
  return Promise.resolve(data)
    .then(enrichItem)
    .then((_data) => {
      return browser.tabs.update(data.tabId, { active: true })
    })
    .catch(print.failure_set_tab_active);
};

// TODO allow update but not focus when clicked w/shift or something
export const setWindowActive = (data) => {
  return Promise.resolve(data)
    .then(print.start_set_window_active)
    .then(enrichItem)
    .then((_data) => {
      return browser.windows.update(
        _data.windowId,
        { focused: true }
      );
    })
    .catch(print.failure_set_window_active);
}


// --- tab ops
// NOTE: all 'get' types dont have a catch failure by design

export const getAllTabs = (params) => {
  return Promise.resolve(params)
    .then(browser.tabs.query)
    .then((tabs) => {
      return tabs.filter((tab) => tab != tabs.TAB_ID_NONE);
    })
    .catch(print.failure_get_all_tabs)
}

export const getAllWindows = (params) => {
  return Promise.resolve(params)
    .then(browser.windows.getAll)
    .then((_windows) => {
      return _windows.filter((_window) => _window.id != _windows.WINDOW_ID_NONE);
    })
    .catch(print.failure_get_all_windows)
}

export const getCurrentWindow = (params) => {
  return Promise.resolve(params)
    .then(browser.windows.getCurrent)
    .catch(print.failure_get_current_window);
}

export const getWindowByPrefix = (prefix) => {
  return getAllWindows()
    .then((_windows) => {
      return _windows.filter((_window) => {
        _window.title.indexOf(prefix) != -1
      })
    })
    .catch(print.failure_get_window_by_prefix)
}

export const getCurrentWindowTabs = () => {
  return browser.tabs.query({
    windowId: browser.windows.WINDOW_ID_CURRENT
  })
  .then((tabs) => {
    return tabs.filter((tab) => tab != tabs.TAB_ID_NONE);
  })
  .catch(print.failure_get_current_window_tabs);
}

export const getCurrentActiveTab = () => {
  return browser.tabs.query({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT
  })
  .catch(print.failure_get_current_tab);
};

export const getHighlightedTabs = (params) => {
  return Promise.resolve(params)
    .then((_params) => ({
      // params: _params,
      highlighted: true,
      windowId: browser.windows.WINDOW_ID_CURRENT
    }))
    .then(browser.tabs.query)
    .catch(print.failure_get_highlighted_tabs);
}

export const getPlayingTabs = (params) => {
  return browser.tabs.query({ audible: true })
    .catch(print.failure_get_playing_tabs);
}

// ---- filter


export const tabQueries = (arg) => {
  return {
    // objects: all, window, this
    here: getCurrentActiveTab,
    this: getCurrentActiveTab,
    tab: getCurrentActiveTab,
    window: getCurrentWindowTabs,
    selected: getHighlightedTabs,
    all: getAllTabs,
    playing: getPlayingTabs,
  }[arg];
};



export const tagQueries = (arg) => {
  return {
    //
    prefix: getWindowByPrefix,
  }[arg];
};


export const validateFilter = (params) => {};

export const tabIdQueries = (arg) => {
  return {
    single: tabQueries('this')
      .then((tab) => tab.id)
      .catch(print.failure_tab_id_single),
    plural: tabQueries('window')
      .then((tabs) => tabs.map((tab) => tab.id))
      .catch(print.failure_tab_id_plural),
  }[arg]
};

export const filterTabsBy = (params) => {
  return {
    url: (tabs) => tabs.filter((tab) => new RegExp(params[1]).test(tab.url)),
    playing: (tabs) => { tabs.filter((tab) => tab.audible)},
    last: (tabs) => { tabs },
    tag: (tabs) => { tabs },
  }[params[0]]
}

export const filterTabs = (params) => {
  let filter = Promise.resolve(params)
    .then(filterTabsBy)
    .catch(print.failure_filterTabsBy);

  return getAllTabs()
    .then(filter)
    .catch(print.failure_filter_tabs)
}

export const updatePlaying = (store) => {
  return browser.tabs.query({
    audible: true
  })
  .then(reduceTabs)
  .then((tabs) => {
    store.update((knownTabs) => {
      return Object.values(
        reducePlaying(tabs, // second
          reducePlaying(knownTabs, {}) // first
        )
      );
    })
  }).catch(print.failure_update_playing);
};

export const saveTab = (params) => {
  // params: tabData, saveKey
}

export const loadTab = (params) => {
  // params: tabUri, originKey
}



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
