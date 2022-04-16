// 2nd order
import { get } from 'svelte/store';
import { stores } from "./stores.js";

// -- feedback via print or notify

export const print = new Proxy(() => {}, {
  get(target, name) {
    let _name = name.toUpperCase().split('_');
    return (args) => {
      console.log(`[${_name[0]}][${_name.slice(1).join('_')}]`, args);
      return args;
    }
  }
});
print.load_apis();

export const notify = new Proxy(() => {}, {
  get(target, name) {
    let _name = name.toUpperCase().split('_');
    console.log("NOTIFYING", name);
    return (args) => {
      const state = _name[0];
      return browser.notifications.create({
        type: "basic",
        title: _name[0],
        message: _name.slice(1).join('_'),
        // buttons: params.buttons || []
      })
      .catch(print.failure_notify)
      .finally(() => args);
    }
  }
});
// notify.load_apis();

// export const notify.success = (params) => {
//   console.log("[SUCCESS][NOTIFIED]", params);
//   return notify({
//     title: "Success!",
//     message: `For ${params ? params.title : 'your action.' }`
//   })
// }

// export const notify.failure = (params) => {
//   console.log("[FAILURE][NOTIFIED]", params);
//   return notify({
//     title: "Error",
//     message: `For ${params ? params.title : 'your action.'}`
//   })
// }

// -- util

function zip(keys, vals) {
  return keys.reduce((m, key, index) => {
    m[key] = vals[index];
    return m;
  }, {});
}


export const resolvePath = (path, obj, separator='.') => {
  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
}

export const intersection = (sA, sB) => {
  return Promise.resolve(sA)
    .then((_sA) => new Set([_sA].flat(1)))
    .then(print.status_intersection_sA)
    .then((_sA) => {
      const result = new Set();
      for (let elem of sB) {
        if (_sA.has(elem)) {
          console.log("[INTERSECTION]", elem)
          result.add(elem);
        }
      }
      console.log("[DONE]", result)
      return [...result];
    })
    .catch(print.failure_intersection);
};


export const union = (sA, sB) => {
  const _keys = new Set(sA);
  for (let elem of sB) {
    _keys.add(elem);
  }
  return [..._keys];
};


// attempt to fix the DataCloneError error,
// where sendMessage of some kind includes
// methods in an object, so they need to be pruned
export const pruneMethods = (value) => {
  return Promise.resolve(value)
    .then(JSON.parse(JSON.stringify(value)))
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
  let baseUrl = get(stores.config).host.uri;
  return Promise.resolve(new URL(params.uri, baseUrl))
    .then((url) => {
      for (let arg in params.args) {
        url.searchParams.append(arg, params.args[arg]);
      }
      return url;
    })
    .then(fetch)
    .then(handleResponse)
    .catch(print.failure_fetch);
};

export const _send = async (params) => {
  // let baseUrl = "http://localhost:3000";
  let baseUrl = get(stores.config).host.uri;
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
    .catch(print.failure_send);
}

// -- system

export const doReloadSystem = (params) => {
  return browser.runtime.reload().
    catch(print.failure_do_reload_system);
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

export const loadCommands = async (params) => {
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

export const getAllTabs = async () => {
  return browser.tabs.query({})
    .then((tabs) => {
      return tabs.filter((tab) => tab != tabs.TAB_ID_NONE);
    })
    .catch(print.failure_get_all_tabs)
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

export const getHighlightedTabs = (newClip) => {
  return browser.tabs.query({
      highlighted: true,
      // active: true,
      windowId: browser.windows.WINDOW_ID_CURRENT
    })
    .catch(print.failure_get_highlighted_tabs);
}

export const getPlayingTabs = (params) => {
  return browser.tabs.query({ audible: true })
    .catch(print.failure_get_playing_tabs);
}

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


export const validateFilter = (params) => {};

export const filterBy = (params) => {
  return {
    url: (tabs) => tabs.filter((tab) => new RegExp(params[1]).test(tab.url)),
    playing: (tabs) => { tabs },
    last: (tabs) => { tabs },
    tag: (tabs) => { tabs },
  }[params[0]]
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


// ------- Storage


export const getQueriedTabs = (params) => {
  return Promise.resolve(params)
    .then((_params) => _params.length ? _params[0] : 'this')
    .then(tabQueries) // keyword
    // .then(print.status_tab_query)
    .then((tabQuery) => tabQuery())
    .then(reduceTabs)
    .then((tabs) => {
      return tabs.map((tab) => ({
        ...tab,
        tag: [_tag].flat(1),
        timestamp: Date.now(),
        // language: browser.tabs.detectLanguage(tab.id)
      }));
    })
    .catch(print.failure_stash_tabs);

}

export const getAllStorageLocal = (params) => {
  return Promise.resolve((params && params.length) ? params : undefined)
    .then(browser.storage.local.get)
    .catch(print.failure_sync);
}

export const setupStorage = (params) => {
  return browser.storage.local.onChanged.addListener((changes) => {
    Promise.resolve(changes)
      .then(Object.entries)
      .then((entries) => {
        entries.forEach((entry) => {
          let key = entry[0];
          let oldValue = entry[1].oldValue;
          let newValue = entry[1].newValue;
        })
      })
      .catch(print.failure_setup_storage);
    });
}

export const syncStorage = (params) => {
  // params: storageKey, priority:mine|theirs|merge
  return browser.storage.local.get(params)
    .then((data) => ({
      uri: `/api/pkg/mine/sync`, // TODO enable custom and automatic package names
      body: data
    }))
    .then(_send)
    .catch(print.failure_sync_storage);
}

export const clearStorageKey = (params) => {
  // params: storageKey == saveKey == originKey
  let storageKey = params[0];
  return Promise.resolve({
      storageKey:[]
    })
    .then(browser.storage.local.set)
    .catch(print.failure_storage_clear)

}

// ------- Register content script

export const _unregisterScript = (subPointer) => {
  return subPointer.unregister();
}

export const _registerScript = (message) => {
  let hosts = message.hosts;
  let code = message.code;

  return browser.contentScripts.register({
    matches: hosts,
    js: [{code}],
    runAt: "document_idle"
  });
}

// ------- Send to webpage content_inject.js

export const sendToContent = (params) => {
  return Promise.resolve(params)
    .then(print.status_send_to_content)
    .then((data) => {
      browser.tabs.sendMessage(data.tabId, data);
      return data;
    })
    .then(notify.success)
    .catch(print.failure_send_to_content);
}

export const sendToggleLoop = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message:'toggleLoop' }))
    .then(sendToContent)
    .catch(print.failure_send_toggle_loop);
}

export const sendPlayPause = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message:'playPause' }))
    .then(sendToContent)
    .catch(print.failure_send_play_pause);
};

export const sendRestart = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message:'restart' }))
    .then(sendToContent)
    .catch(print.failure_send_restart);
};

export const updateClipboard = (newClip) => {
  return navigator.clipboard.writeText(newClip)
    .catch(print.failure_update_clipboard);
};


export const setupMenuSaveText = () => {
  browser.contextMenus.create({
    title: 'Add selected to Focus',
    id: 'add-selected-to-focus',
    contexts: ['selection'],
  })
  .catch(print.failure_create_context_menu);

  browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'add-selected-to-focus') {
      // clipboard.writeText();
      browser.storage.local.get("notes")
        .then((result) => result.notes)
        .then((_notes) => ({
          notes: [
            ..._notes,
            `${info.pageUrl.split('#')[0]}#:~:text=${encodeURIComponent(info.selectionText)}`
          ]
        }))
        .then(browser.storage.local.set)
        .catch(print.failure_focus_add_selected);
    }
  });
}

export const doSelectedCopy = async (e) => {
  return getHighlightedTabs()
    .then((tabs) => {
      console.log('doing selected copy:', browser.windows.WINDOW_ID_CURRENT, tabs);
      return tabs.map((tab) => `${tab.title},${tab.url}`).join('\n');
    })
    .then(updateClipboard)
    .then(notify.success)
    .catch(print.failure_selected_copy);
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
    .then(notify.success)
    .catch(print.failure_download_video);
}

export const bringToFront = (e) => {
  return Promise.resolve(e)
    .then((_e) => e.detail ? e.detail : e)
    .then(print.start_bring_to_front)
    .then(setTabActive)
    .then(setWindowActive)
    .then(print.success)
    .catch(print.failure_bring_to_front);
}

export const updateCurrentWindow = async (params) => {
  return browser.windows.update(
    browser.windows.WINDOW_ID_CURRENT,
    params
  ).catch(print.failure_update_current_window);
};


export const setPinnedTab = async (params) => {
  return getHighlightedTabs().then( (tabs) => {
    for (const tab of tabs) {
      browser.tabs.update(tab.id, { pinned: true })
        .catch(print.failure_update_tab_pinned);
    }
  });
};

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

// ---- filter

export const filter = () => {

};

export const filterTabs = (params) => {
  return getAllTabs()
    .then((tabs) => tabs.filter((tab) => new RegExp(params[0]).test(tab.url)))
    .catch(print.failure_filter_tabs)
}

// ---- reduce

export const reducePlaying = (tabs, obj) => {
  if (!tabs) { return null; }
  if (!obj) { obj = {}; }
  return tabs.reduce((_out, curr) => {
    if (!_out[curr.name]) {
      _out[curr.name] = curr;
    }
    return _out;
  }, obj);
};

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

export const reduceTabs = (tabs) => {
  return tabs.map((tab) => {
    return {
      uri: tab.url,
      url: tab.url,
      label: tab.title,
      title: tab.title,
      tabId: tab.id,
      windowId: tab.windowId,
      muted: tab.mutedInfo.muted,
      playing: tab.audible,
      article: tab.isArticle,
      timestamp: Date.now(),
      // icon: tab.favIconUrl, // spammy base64 rendering
      // language: browser.tabs.detectLanguage(tab.id)
    }
  })
}

// -- content processing

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

export const setStore = (params) => {
  return stores[params.name];
};


export const checkKeymap = (params) => {};
export const updateKeymap = (params) => {};
export const undoKeymap = (params) => {};
// export const _ = (params) => {};
// export const _ = (params) => {};

// -- ensemble / client / api functions



export const fileList = async (params) => {
  // _fetch("/api/file/search", params).then( (data) => {
  //   stores.files.update(n => ({...n, ...data, dirty: false }));
  //   console.log("updated filelist", data, params);
  // }).catch ((err) => {
  //   console.log("failed to update filelist", err, params);
  // })
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

    // stores.actionHistory.update(n => [...(n || []), data]);

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
  const date = dateStringFromDate(new Date());
  return Promise.resolve(val)
    .then((_val) => ({
      ...val,
      at: Math.floor(Date.now() / 1000),
      timestamp: date
    }))
    .then((_val) => {
      stores.eventLog.update((n) => [...(n.length ? n : (n ? [n] : [])), _val])
    })
    .catch(print.failure__update_log);
}

export function updateLog(e) {
  return Promise.resolve(e)
    .then((_e) => _e.detail)
    .then(_updateLog)
    .catch(print.failure_update_log)
}

// -- playlist controls 1


export function startPlaylist(name) {
  /*
  1. get profile data
  2. update profile data with playlist cursor
  3. cursor entry for 'active package'
  4. cursor location is url, and progress
  5. cursor has a history
  6. shows past played, duration, notes
  7. cursor lookahead shows next item in playlist
  8. cursor history is a collection of objects in key-value stores
  9. suggestion functions based on next, and past history items
  10. operations for the current playlist item, the current cursor location
  11. location is by object, as location is over time and object resulting from action
  */
  return browser.storage.local.get('stash')
    .then((_stash) => _stash.stash)
    .then((data) => data[name])
    .then((playlist) => {
      return playlist.reduce((sum, item) => {
        return sum[item.name]
      }, {})
    })
    .then(start)
    .catch(print.failure_start_playlist);
}



// -- subscriptions

stores.layoutItems.subscribe(val => {
  console.log("[update] stores.layoutItems update", val)
});

stores.config.subscribe((val) => {
  console.log("[update] stores.workspace update", val);
});

// stores.eventLog.subscribe((val) => {
//   console.log("[update] stores.eventLog update", val);
//   // if (val && Object.keys(val).length > 0) {
//   //   sendProfileUpdate('action', val);
//   // }
// });

// stores.actionHistory.subscribe((val) => {
//   console.log("[update] stores.actionHistory update", val);
// });
