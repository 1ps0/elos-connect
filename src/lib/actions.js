

import * as send from "./send.js";
import * as proxy from "./apis/proxy.js";
import * as network from "./network.js";
import * as tabs from "./apis/tabs.js";

// ---------- Actions



// -- system

export const unloadTabs = (tabs) => {
  return Promise.resolve(tabs)
    .then((tabs) => tabs.map((tab) => browser.tabs.update(tab.id, {
      active: false,
      discarded: true
    })))
    .then(Promise.all)
    .catch(proxy.print.failure_unload_tabs)
}
// export const doUnloadTabs = (tabs) => {
//   return Promise.resolve(tabs)
//     .then(browser.tabs.discard)
//     .catch(print.failure_unload_tabs)
// }

export const reloadSystem = (args) => {
  return Promise.resolve(args)
    .then(browser.runtime.reload)
    .catch(proxy.print.failure_do_reload_system);
}


// ---

export const updatePlaying = (store) => {
  return browser.tabs.query({
    audible: true
  })
  .then(reduce.tabs)
  .then((tabs) => {
    store.update((knownTabs) => {
      return Object.values(
        reducePlaying(tabs, // second
          reducePlaying(knownTabs, {}) // first
        )
      );
    })
  }).catch(proxy.print.failure_update_playing);
};

export const selectedCopy = async (e) => {
  return tabs.getHighlightedTabs()
    .then((tabs) => {
      console.log('doing selected copy:', browser.windows.WINDOW_ID_CURRENT, tabs);
      return tabs.map((tab) => `${tab.title},${tab.url}`).join('\n');
    })
    .then(updateClipboard)
    .then(proxy.notify.success)
    .catch(proxy.print.failure_selected_copy);
}

export const downloadVideo = (params) => {
  return tabs.getCurrentActive()
    .then((tab) => ({
      uri: "api/action/download/video",
      body: {
        uri: tab[0].url,
      }
    }))
    .then(_send)
    .then(proxy.notify.success)
    .catch(proxy.print.failure_download_video);
}

export const bringToFront = (e) => {
  return Promise.resolve(e)
    .then((_e) => e.detail ? e.detail : e)
    .then(proxy.print.start_bring_to_front)
    .then(tabs.setTabActive)
    .then(windows.setWindowActive)
    .then(proxy.print.success)
    .catch(proxy.print.failure_bring_to_front);
}


export const updateClipboard = (newClip) => {
  return Promise.resolve(newClip)
    .then(navigator.clipboard.writeText)
    .catch(proxy.print.failure_update_clipboard);
};


// --- 

export const applyDarkMode = (e) => {
  return getCurrentActive()
    .then(send.setDarkMode)
    .then(proxy.print.success_apply_dark_mode)
    .catch(proxy.print.failure_apply_dark_mode)
}


// -- event callbacks


export const _updateLog = (val) => {
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
    .catch(proxy.print.failure__update_log);
}


export const updateLog = (e) => {
  return Promise.resolve(e)
    .then((_e) => _e.detail)
    .then(_updateLog)
    .catch(proxy.print.failure_update_log)
}

// --- extractions

export const extractReaderText = (e) => {
  // browser.runtime.onMessage.addListener(registerScript);
  return tabs.getCurrentActive()
    .then((_tabs) => {
      return _tabs.filter((tab) => tab.isArticle)[0];
    })
    .then((tab) => {
        !tab.isInReaderMode ? browser.tabs.toggleReaderMode() : false;
        return tab.id;
    })
    .then((tabId) => ({
      tabId: tabId,
      message:'extractReaderText'
    }))
    .then(send.sendToContent)
    .then(proxy.print.status_content_response_reader_text)
    .then((pageData) => ({
      uri: "api/analysis/data",
      body: pageData,
    }))
    .then(network._send)
    .catch(proxy.print.failure_extract_reader_text);
}


// -- playlist controls 1


export const startPlaylist = (name) => {
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
    .catch(proxy.print.failure_start_playlist);
}



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
            .catch(proxy.print.failure_restore_tab);
        } else {
          browser.sessions.restore(session.window.sessionId)
            .catch(proxy.print.failure_restore_window);
        }
      })
      return sessions;
    })
    .catch(proxy.print.failure_restore_session);
}

// FIXME experimental processing chain
export const enrichItem = (item) => {
  return Promise.resolve(item)
    // .then(addActiveWindowId)
    // .then(addActiveTabId)
    .catch(proxy.print.failure_enrich_item);
}
