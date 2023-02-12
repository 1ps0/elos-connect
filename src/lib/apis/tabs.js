
import { print, notify, register } from "./proxy.js";

// --- tab ops
// NOTE: all 'get' types dont have a catch failure by design

export const getAll = (args) => {
  return Promise.resolve(args)
    .then(browser.tabs.query)
    .then((tabs) => {
      return tabs.filter((tab) => tab != tabs.TAB_ID_NONE);
    })
    .catch(print.failure_get_all_tabs)
}


export const getCurrentWindow = () => {
  return Promise.resolve({
      windowId: browser.windows.WINDOW_ID_CURRENT
    })
    .then(browser.tabs.query)
    .then((tabs) => {
      return tabs.filter((tab) => tab != tabs.TAB_ID_NONE);
    })
    .catch(print.failure_get_current_window_tabs);
}

export const getCurrentActive = () => {
  return Promise.resolve({
      active: true,
      windowId: browser.windows.WINDOW_ID_CURRENT
    })
    .then(browser.tabs.query)
    .then(_tab_array => _tab_array[0])
    .then(print.success_current_active_tab)
    .catch(print.failure_get_current_tab);
};

export const getHighlighted = (args) => {
  return Promise.resolve(args)
    .then((_args) => ({
      // args: _args,
      highlighted: true,
      windowId: browser.windows.WINDOW_ID_CURRENT
    }))
    .then(browser.tabs.query)
    .catch(print.failure_get_highlighted_tabs);
}

export const getPlaying = (args) => {
  return browser.tabs.query({ audible: true })
    .catch(print.failure_get_playing_tabs);
}


export const move = (tabs, _window) => {
  console.log("MOVE TAB", tabs, _window);
  return browser.tabs.move(tabs, {
      index: -1, // arg reverse: 0 to reverse, -1 to stay same
      windowId: _window.id
    })
    .catch(print.failure_move_tab)
}

const addActiveTabId = (data) => {
  return browser.tabs.query({ active: true })
    .then((tabs) => ({
      ...data,
      tabId: tabs[0].id
    }))
    .catch(print.failure_add_active_tab_id)
}

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

export const filterBy = (args) => {
  return {
    url: (tabs) => tabs.filter((tab) => new RegExp(args[1]).test(tab.url)),
    playing: (tabs) => { tabs.filter((tab) => tab.audible)},
    last: (tabs) => { tabs },
    tag: (tabs) => { tabs },
  }[args[0]]
}

export const filter = (args) => {
  let filter = Promise.resolve(args)
    .then(filterTabsBy)
    .catch(print.failure_filterTabsBy);

  return getAllTabs()
    .then(filter)
    .catch(print.failure_filter_tabs)
}


export const setActive = (data) => {
  console.log("Setting active tab with data", data);
  return Promise.resolve(data)
    .then(enrichItem)
    .then((_data) => {
      return browser.tabs.update(data.tabId, { active: true })
    })
    .catch(print.failure_set_tab_active);
};

export const setPinned = async (args) => {
  return tabs.getHighlightedTabs().then( (tabs) => {
    for (const tab of tabs) {
      browser.tabs.update(tab.id, { pinned: true })
        .catch(print.failure_update_tab_pinned);
    }
  });
};

// ---- filter

// semantic grouping by name: module by return type
// eg: tabs functions return tab objects, 
//     windows functions return window objects
export const queries = (arg) => {
  return {
    // objects: all, window, this
    here: getCurrentActive,
    this: getCurrentActive,
    tab: getCurrentActive,
    window: getCurrentWindowTabs,
    selected: getHighlightedTabs,
    all: getAllTabs,
    playing: getPlayingTabs,
  }[arg];
};


export const getQueried = (args) => {
  return Promise.resolve(args)
    .then((_args) => _args.length ? _args[0] : 'this')
    .then(queries) // keyword
    // .then(print.status_tab_query)
    .then((tabQuery) => tabQuery())
    .then(reduceTabs)
    .then((tabs) => {
      return tabs.map((tab) => ({
        ...tab,
        tag: [args.slice(1)].flat(1),
        timestamp: Date.now(),
        // language: browser.tabs.detectLanguage(tab.id)
      }));
    })
    .catch(print.failure_stash_tabs);

}
