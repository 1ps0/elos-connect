import * as proxy from './proxy.js';

// --- tab ops
// NOTE: all 'get' types dont have a catch failure by design

export const all = (args) => {
  return Promise.resolve(args)
    .then(browser.tabs.query)
    .then((tabs) => {
      return tabs.filter((tab) => tab != tabs.TAB_ID_NONE);
    })
    .catch(proxy.print.failure_get_all_tabs);
};

export const all_else = (args) => {
  return Promise.resolve(args)
    .then(queried('all'))
    .then(_all_tabs => {
      return _all_tabs - queried('this')
    })
    .then(proxy.print.status_get_all_else)
    .catch(proxy.print.failure_get_all_else);
}

export const move = (tabs, _window) => {
  console.log('MOVE TAB', tabs, _window);
  return browser.tabs
    .move(tabs, {
      index: -1, // arg reverse: 0 to reverse, -1 to stay same
      windowId: _window.id,
    })
    .catch(proxy.print.failure_move_tab);
};

export const currentWindow = () => {
  return Promise.resolve({
    windowId: browser.windows.WINDOW_ID_CURRENT,
  })
    .then(browser.tabs.query)
    .then((tabs) => {
      return tabs.filter((tab) => tab != tabs.TAB_ID_NONE);
    })
    .catch(proxy.print.failure_get_current_window_tabs);
};

export const currentActive = () => {
  return Promise.resolve({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT,
  })
    .then(browser.tabs.query)
    .then((_tab_array) => _tab_array[0])
    .then(proxy.print.success_current_active_tab)
    .catch(proxy.print.failure_get_current_tab);
};

export const highlighted = (args) => {
  return Promise.resolve(args)
    .then((_args) => ({
      // args: _args,
      highlighted: true,
      windowId: browser.windows.WINDOW_ID_CURRENT,
    }))
    .then(browser.tabs.query)
    .catch(proxy.print.failure_get_highlighted_tabs);
};

export const playing = (args) => {
  return browser.tabs
    .query({ audible: true })
    .catch(proxy.print.failure_get_playing_tabs);
};

export const addActiveTabId = (data) => {
  return browser.tabs
    .query({ active: true })
    .then((tabs) => ({
      ...data,
      tabId: tabs[0].id,
    }))
    .catch(proxy.print.failure_add_active_tab_id);
};

export const filterBy = (args) => {
  return {
    url: tabs => tabs.filter((tab) => new RegExp(args[1]).test(tab.url)),
    playing: tabs => tabs.filter((tab) => tab.audible),
    last: tabs => tabs,
    tag: tabs => tabs,
  }[args[0]];
};

export const filter = (args) => {
  let _filter = Promise.resolve(args)
    .then(filterBy)
    .catch(proxy.print.failure_tabs_filterBy);

  return all().then(_filter).catch(proxy.print.failure_filter_tabs);
};

export const setActive = (data) => {
  console.log('Setting active tab with data', data);
  return Promise.resolve(data)
    // .then(enrichItem)
    .then((_data) => {
      browser.tabs.update(_data.tabId, { active: true });
      return _data
    })
    .catch(proxy.print.failure_tab_set_active);
};

export const setPinned = async (args) => {
  return tabs.highlighted().then((tabs) => {
    for (const tab of tabs) {
      browser.tabs
        .update(tab.id, { pinned: true })
        .catch(proxy.print.failure_tab_update_pinned);
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
    here: currentActive,
    this: currentActive,
    tab: currentActive,
    window: currentWindow,
    selected: highlighted,
    all: all,
    else: all_else,
    playing: playing,
  }[arg];
};

export const getQueried = (args) => {
  return Promise.resolve(args)
  .then(_args => _args ? _args : [])
  .then(_args => _args.length ? _args[0] : 'this')
  .then(queries) // keyword
  // .then(proxy.print.status_tab_query)
  .then(tabQuery => (tabQuery || currentActive)())
  .then(_tabs => (_tabs.length ? _tabs : [_tabs]))
  .then(_tabs => _tabs.map(reduce))
  .then(_tabs => {
    return _tabs.map((tab) => ({
      ...tab,
      // tag: [args.slice(1)].flat(1),
      timestamp: Date.now(),
      // language: browser.tabs.detectLanguage(tab.id)
    }));
  })
  .catch(proxy.print.failure_tabs_get_queried)
};

export const reduce = (tab) => {
  return Promise.resolve(tab)
    .then((_tab) => ({
      uri: tab.url,
      url: tab.url,
      label: tab.title,
      title: tab.title,
      tabId: tab.id,
      windowId: tab.windowId,
      muted: tab?.mutedInfo?.muted,
      playing: tab.audible,
      article: tab.isArticle,
      timestamp: Date.now(),
      // icon: tab.favIconUrl, // spammy base64 rendering
      // language: browser.tabs.detectLanguage(tab.id)
    }))
    .catch(proxy.print.failure_reduce_tab);
};

// ----
