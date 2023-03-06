(function (exports) {
    'use strict';

    function noop() { }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    Promise.resolve();

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const print = new Proxy(() => {}, {
      get(target, name) {
        return (args) => {
          let _name = name.toUpperCase().split('_');
          console.log(`[${_name[0]}][${_name.slice(1).join('_')}]`, args);
          return args;
        }
      }
    });

    const notify$1 = new Proxy(() => {}, {
      // TODO set alert level filtering based on _name[0]
      get(target, name) {
        let _name = name.toUpperCase().split('_');
        console.log("NOTIFYING", name, target);
        return (args) => {
          _name[0];
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

    //.then(register.success_last_message)
    new Proxy(() => {}, {
      get(target, name) {
        let _name = name.toUpperCase().split('_');
        return (args) => {
          console.log(`[REGISTER][${_name[0]}][${_name.slice(1).join('_')}]`, args);
          return args;
        }
      }
    });

    // TODO this might be a router for complex data transformers
    // export const include = new Proxy(() => {}, {
    //   get(target, name) {
    //     return (args) => {
    //       console.log(`[INCLUDE][${name}]`, args);
    //       if (name == 'tabs') {

    //       }
    //       return {
    //         ...args,

    //       };
    //     }
    //   }
    // });

    const setTitle = (data) => {
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

    const getAll$2 = (params) => {
      return Promise.resolve(params)
        .then(browser.windows.getAll)
        .then((_windows) => {
          return _windows.filter((_window) => _window.id != _windows.WINDOW_ID_NONE);
        })
        .catch(print.failure_get_all_windows)
    };

    const getCurrent = (params) => {
      return Promise.resolve(params)
        .then(browser.windows.getCurrent)
        .catch(print.failure_get_current_window);
    };

    const updateCurrent = (params) => {
      return browser.windows.update(
        browser.windows.WINDOW_ID_CURRENT,
        params
      ).catch(print.failure_update_current_window);
    };

    const create = (tabs) => {
        return Promise.all(
            tabs.map((tab) => {
                return Promise.resolve(tab)
                    .then(_tab => ({
                        parentId: "monitoring",
                        title: tab.title,
                        url: tab.url,
                    }))
                    .then(browser.bookmarks.create)
                    .catch(print.failure_create_tab_bookmark)
            })
        );
    };

    const renderNode = (_path, node) => {
      return {
        path: _path,
        label: node.title,
        uri: node.url,
        index: node.index,
        type: node.type,
        addedAt: node.dateAdded,
        modifiedAt: node.dateGroupModified,
      }
    };

    const recurseNodes = (node, path) => {
      let _children = node.children;
      if (!_children)
        return [renderNode(path, node)];

      let nodes = [];
      for (let x = 0; x < _children.length; x++) {
        let _node = _children[x];
        let _path = `${path}/${_node.title}`;
        nodes = nodes.concat(recurseNodes(_node, _path));
      }
      return nodes;
    };

    const extract = (args) => {
      return browser.bookmarks.getTree()
        .then(node => recurseNodes(node[0], '.'))
        .catch(print.failure_extract_bookmarks)
    };

    const getAll$1 = (args) => {
      return Promise.resolve(args)
        .then(extract)
        .then(print.status_bookmarks_get_tree)
        .catch(print.failure_get_tree);
    };

    const search = (args) => {};

    (() => {
      if (typeof browser !== "undefined" && browser.bookmarks) {
        return browser.bookmarks;
      } else if (typeof chrome !== "undefined" && chrome.bookmarks) {
        return chrome.bookmarks;
      } else {
        throw new Error("Bookmark API not supported");
      }
    })();

    // --- tab ops
    // NOTE: all 'get' types dont have a catch failure by design

    const getAll = (args) => {
      return Promise.resolve(args)
        .then(browser.tabs.query)
        .then((tabs) => {
          return tabs.filter((tab) => tab != tabs.TAB_ID_NONE);
        })
        .catch(print.failure_get_all_tabs)
    };

    const getCurrentActive = () => {
      return Promise.resolve({
          active: true,
          windowId: browser.windows.WINDOW_ID_CURRENT
        })
        .then(browser.tabs.query)
        .then(_tab_array => _tab_array[0])
        .then(print.success_current_active_tab)
        .catch(print.failure_get_current_tab);
    };

    const getHighlighted = (args) => {
      return Promise.resolve(args)
        .then((_args) => ({
          // args: _args,
          highlighted: true,
          windowId: browser.windows.WINDOW_ID_CURRENT
        }))
        .then(browser.tabs.query)
        .catch(print.failure_get_highlighted_tabs);
    };


    const move = (tabs, _window) => {
      console.log("MOVE TAB", tabs, _window);
      return browser.tabs.move(tabs, {
          index: -1, // arg reverse: 0 to reverse, -1 to stay same
          windowId: _window.id
        })
        .catch(print.failure_move_tab)
    };

    const filter = (args) => {
      let filter = Promise.resolve(args)
        .then(filterTabsBy)
        .catch(print.failure_filterTabsBy);

      return getAllTabs()
        .then(filter)
        .catch(print.failure_filter_tabs)
    };

    // ---- filter

    // semantic grouping by name: module by return type
    // eg: tabs functions return tab objects, 
    //     windows functions return window objects
    const queries = (arg) => {
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


    const getQueried = (args) => {
      return Promise.resolve(args)
        .then((_args) => _args.length ? _args[0] : 'this')
        .then(queries) // keyword
        // .then(proxy.print.status_tab_query)
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

    };

    // ----

    /*
    3rd order item for managing workspace objects
    */


    // WORKSPACE

    const workspaceConfig = {
      loadedAt: new Date(),
      version: '0.0.12-prealpha',
      logs: {
        level: "debug",
        target: "local",
        quiet: {
          keywords: [''],
          prefix: ['status', 'success'],
          suffix: ['mounted'],
        },
      },
      notify: {
        level: "error",
        target: "remote",
        quiet: {
          keywords: [''],
          prefix: ['status', 'success'],
          suffix: ['mounted'],
        },
      },
      hosts: {
        local: {
          name: "localhost",
          active: true,
          default: true,
          uri: "http://localhost:3000",
          search: "/api/search",
        },
        remote: {
          name: "remote-1",
          active: false,
          default: false,
          uri: "http://192.168.99.156:3000",
          search: "/api/search",
        },
      },
      playlist: {
        mine: {
          notes: {}, // browser.tabs.getHighlighted(tab.id), textfield input (markdown editor)
          items: {},
          tags: [], // all tags found/used,
        },
      },
      options: {
        filterby: {
          default: "this",
          handleFailure: "stop.critical" // stop proxy actions for actions or ongoing panel monitoring. like an interrupt
        },

      },
      playlistHistory: [],
      recentlySaved: [],
      todo: {},
      journal: [],

    };

    // 2nd order, +complexity dependent @../config/parameters

    const bookmarksFor = (name, otherwise={}) => {
      return Promise.resolve(name)
        .then(search)
        .catch(print.failure_bookmarks_for)
    };

    const configWritable = writable(workspaceConfig);
    const layoutItemsWritable = writable(bookmarksFor("layoutItems", { items: [], add: [] }));

    const stores = {
      config: configWritable,
      layoutItems: layoutItemsWritable,
    };


    Object.entries(stores).forEach((entry) => {
      entry[0];
      let store = entry[1];
      store.subscribe((val) => {
        if (val !== undefined && val !== "undefined") {
          return Promise.resolve({ name: val })
            .then(search)
            .then(print.success_storage_bookmarks)
            .catch(print.failure_storage_bookmarks);
        }
      });
    });

    // -- primitive functions

    const handleResponse = (response) => {
      if (response.ok) { // if HTTP-status is 200-299
        return response.json();
      } else {
        console.log("HTTP-Error: ", response.status);
        return null;
      }
    };

    const _fetch = (args) => {
      if (!args || !args.uri || !args.baseURI) {
        return Promise.reject(args)
      }
      if (!args.baseURI) {
        args.baseURI = "http://localhost:3000";
        // get(stores.config).hosts.local.uri
      }
      return Promise.resolve(new URL(args.uri, baseURI))
        .then((url) => {
          for (let arg in args.args) {
            url.searchargs.append(arg, args.args[arg]);
          }
          return url;
        })
        .then(fetch)
        .then(handleResponse)
        .then(register.success_last_message)
        .catch(print.failure_fetch);
    };

    const _send = (args) => {
      if (!args || !args.uri || !args.baseURI) {
        return Promise.reject(args)
      }
      if (!args.baseURI) {
        args.baseURI = "http://localhost:3000";
        // get(stores.config).hosts.local.uri
      }
      return Promise.resolve(new URL(args.uri, baseURI))
        .then((url) => {
          return {
            url: url,
            method: "POST",
            credentials: "omit",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(args.body)
          }
        })
        .then((args) => fetch(args.url, args))
        .then(handleResponse)
        .then(register.success_last_message)
        .catch(print.failure_send);
    };

    const resetOmnibox = (args) => {
      return [args, browser.theme.reset()];
    };

    /*
    1st order

    low order item for configuring the layoutgrid(s). no deeper dependencies that point to higher order
    - TODO icon dependency
    */

    const actionItems = [
      {
        name: "action-compact",
        value: { icon: "view-mode-2", highlight: "Move panels in close together." },
        group: "1"
      },
      // {
      //   name: "action-",
      //   value: { icon: "view-mode-2", highlight: "Move panels in close together." },
      //   group: "1"
      // },
    ];


    // GRID MENU PANEL
    const menuItems = [
      {
        name: "panel-actionmenu",
        value: { icon: "view-mode-2", highlight: "Menu of Browser Actions" },
        group: "1"
      },
      {
        name: "panel-web-players",
        value: { icon: "view-modes", highlight: "Web Players" },
        group: "1"
      },
      {
        name: "panel-playlists",
        value: { icon: "table", highlight: "Playlists" },
        group: "1"
      },
      {
        name: "panel-focus",
        value: { icon: "status-pin", highlight: "Focus" },
        group: "1"
      },
      {
        name: "panel-timer",
        value: { icon: "task-add", highlight: "Pomodoro Timer"},
        group: "1"
      },
      {
        name: "panel-entryform",
        value: { icon: "action-add", highlight: "Add Data"},
        group: "1"
      },
      {
        name: "panel-dashboard",
        value: { icon: "composite", highlight: "Dashboard"},
        group: "1"
      },
      {
        name: "panel-config",
        value: { icon: "settings", highlight: "Settings and Config"},
        group: "1"
      },
      {
        name: "panel-todo",
        value: { icon: "list", highlight: "TODO List"},
        group: "1"
      },
      {
        name: "panel-journal",
        value: { icon: "polls", highlight: "Journal"},
        group: "1"
      },
      {
        name: "panel-eventhistory",
        value: { icon: "view-mode-1", highlight: "Event History"},
        group: "1"
      },
      {
        name: "panel-actionhistory",
        value: { icon: "view-mode-2", highlight: "Action History"},
        group: "2"
      },
    ];

    // 2nd order

    /*
    Item Interface:
    menu_item: true,
    bind: { name, callback },
    event: { name, callback },
    props: { prop1: value1, ...},
    name: eg label, display name
    target: eg id, target value for types
    */

    // FIXME centralize and reactivize configs like this
    const layoutConfig = {
      // LAYOUT GRID
      panelGap: 5,
      columnMultiplier: 6,
      columnCount: 100,
      rowHeight: 65,
      mode: "full-width", // default, full-width, full-height, full-screen
    };

    const columnForConfig = (config, columns) => {
      return config.mode === "full-width" ? config.columnCount : columns;
    };

    const panelTypes = {
      "panel-mainmenu": {
        target: "panel-mainmenu",
        name: "mainmenu",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*11,),
        h: 2,
        componentName: "selectlist",
        event: { name: 'menuToggle', callback: "togglePanel" },
        props: {
          showIn: "sidebar",
          eventName: "menuToggle",
          items: menuItems,
          transform: (e) => { return e.value.icon }
        }
      },
      "panel-layout": {
        target: "panel-layout",
        name: "layout",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*11,),
        h: 2,
        componentName: "selectlist",
        event: { name: 'layoutAction', callback: "alignPanel" },
        props: {
          showIn: "sidebar",
          eventName: "layoutAction",
          items: actionItems,
          transform: (e) => { return e.value.icon }
        }
      },
      "panel-dashboard": {
        target: "panel-dashboard",
        name: "dashboard",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*4,),
        h: 5,
        componentName: "dashboard",
        props: {
          showIn: "tab"
        }
      },
      "panel-config": {
        target: "panel-config",
        name: "config",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*4,),
        h: 5,
        componentName: "config",
        props: {
          showIn: "tab"
        }
      },
      "panel-focus": {
        target: "panel-focus",
        name: "focus",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*4,),
        h: 5,
        componentName: "focus",
      },
      "panel-actionmenu": {
        target: "panel-actionmenu",
        name: "actionmenu",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*4,),
        h: 3,
        componentName: "actionmenu",
      },
      "panel-web-players": {
        target: "panel-web-players",
        name: "web_players",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier * 6,),
        h: 3,
        componentName: "web_players",
        event: {
          name: 'filterType',
          callback: 'updateLocations'
        },
        props: {
          eventName: "media.playPause",
          transform: ((e) => e)
        }
      },
      "panel-playlists": {
        target: "panel-playlists",
        name: "playlists",
        w: columnForConfig(layoutConfig),
        h: 4,
        componentName: "playlists",
      },
      "panel-timer": {
        target: "panel-timer",
        name: "timer",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier * 2,),
        h: 4,
        componentName: "timer",
      },
      "panel-todo": {
        target: "panel-todo",
        name: "todo",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*3,),
        h: 5,
        componentName: "todo",
      },
      "panel-eventlog": {
        target: "panel-eventlog",
        name: "eventlog",
        w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*2,),
        h: 3,
        componentName: "itemlist",
        props: {
          readonly: true,
          dataStore: "eventLog",
          transform: (x) => `${x.name} @ ${x.at[1]} `,
          transforms: {
            title: (x) => `${x.name} @ ${x.at[1]} `,
            api: (x) => x,
          }
        }
      },
    };

    // ---- reduce

    const CSVToJSON = (data) => {
      // FIXME
      return data;
    };

    const sync = (args) => {
      // args: storageKey, priority:mine|theirs|merge
      return Promise.resolve(args)
        .then(browser.storage.local.get)
        .then((data) => ({
          uri: `/api/pkg/mine/sync`, // TODO enable custom and automatic package names
          body: data
        }))
        .then(network_send)
        .catch(print.failure_sync_storage);
    };

    // ------- Send to webpage content_inject.js

    const toContent = (args) => {
      return Promise.resolve(args)
        .then(print.status_send_to_content)
        .then((data) => {
          browser.tabs.sendMessage(data.tabId, data);
          return {
            ...data,
            success: true
          };
        })
        .then(notify$1.success)
        .catch(print.failure_send_to_content);
    };

    const toggleLoop = (e) => {
      return Promise.resolve(e)
        .then((data) => ({ tabId: data.tabId, message:'media.toggleLoop' }))
        .then(toContent)
        .catch(print.failure_send_toggle_loop);
    };

    const playPause = (e) => {
      return Promise.resolve(e)
        .then((data) => ({ tabId: data.tabId, message:'media.playPause' }))
        .then(toContent)
        .catch(print.failure_send_play_pause);
    };

    const restart = (e) => {
      return Promise.resolve(e)
        .then((data) => ({ tabId: data.tabId, message:'media.restart' }))
        .then(toContent)
        .catch(print.failure_send_restart);
    };

    // ---------- Actions



    // -- system

    const unloadTabs = (tabs) => {
      return Promise.resolve(tabs)
        .then((tabs) => tabs.map((tab) => browser.tabs.update(tab.id, {
          active: false,
          discarded: true
        })))
        .then(Promise.all)
        .catch(print.failure_unload_tabs)
    };
    // export const doUnloadTabs = (tabs) => {
    //   return Promise.resolve(tabs)
    //     .then(browser.tabs.discard)
    //     .catch(print.failure_unload_tabs)
    // }

    const reloadSystem = (args) => {
      return Promise.resolve(args)
        .then(browser.runtime.reload)
        .catch(print.failure_do_reload_system);
    };


    const updateClipboard = (newClip) => {
      return Promise.resolve(newClip)
        .then(navigator.clipboard.writeText)
        .catch(print.failure_update_clipboard);
    };

    // main cli command structure

    print.load_omnibox();

    let _cmds = {};
    try {
      _cmds = {
        reload: {
          content: "reload",
          description: "reload plugin",
          action: (args) => reloadSystem()
            .then(notify$1.success_reload)
            .catch(notify$1.failure_reload)
        },
        sync: {
          content: "sync",
          description: "sync current state with remote.",
          // suggestions: (args) => {
          //   mine: {
          //     content: "mine",
          //     description: "send mine and prefer it for value conflicts"
          //   }
          // }),
          // TODO sync push, sync pull, set default to which?
          action: (args) => {
            return Promise.resolve(args)
              .then(_args => (_args && _args.length) ? _args : undefined)
              .then(sync)
              .then(notify$1.success_sync)
              .catch(print.failure_sync);
          },
        },
        move: {
          content: "move",
          description: "Move selection to tagged entity",
          // suggestion: (args) => {
          // // TODO suggest: "elos move <this> main", window 2 title: "main | ..."
          // // TODO suggest: "elos move <window> ... (yield window names)"
          // // TODO global.config: suggest defaults: [windows.title, tabs.title, ...]
          // },
          action: (params) => {
            let _tabs = getQueriedTabs([...params, ..._tag]);
            Promise.resolve(args)
              .then((_args) => args.length > 1 ? args.slice(1) : ['popout'])
              .then(getWindowByPrefix)
              .then((_window) => getAll({window: _window.id}))
              .then(_tabs => move(_tabs))
              .then(notify$1.success_move)
              .catch(print.failure_move);
          }
        },
        watch: {
          content: "watch",
          description: "Watch selected field for changes",
          action: (args) => {
            console.log("MOVE");
            let _tag = args.length > 1 ? args.slice(1) : ['selection'];
            return Promise.resolve([...args, ..._tag])
              // .then(tabs.getQueried)
              // .then(tabs.getQueriedTag)
              // TODO add tab listeners for type of watcher (this is a major feature)
              .catch(print.failure_watch)
          }
        },
        stash: {
          content: "stash",
          description: "args: this, window, all | [tag_name]; Capture essential content in each of the selected tabs, and store with stash.",
          suggestions: (args) => {
            return browser.bookmarks.search({title: "stash"})
              .then((bookmarks) => {
                return bookmarks.map((bookmark) => {
                  return {
                    content: bookmark.url,
                    description: bookmark.title
                  }
                });
              })
              .catch(print.failure_stash_suggestions)
              .then(() => [{
                content: "No stash found.",
                description: "No stash found.",
              }]);
          },
          action: (args) => {
            // args: null, "this", "window", "all"
            return Promise.resolve(args)
              .then(getQueried)
              .then(Promise.all)
              .then((__tabs) => __tabs.flat(1))
              .then((tabs) => {
                tabs.forEach((tab) => {
                  if (!tab.tag || tab.tag === "unsorted") {
                    tab.tag = _tag;
                  }
                  create({
                    title: tab.title,
                    url: tab.url,
                    parentId: "stash"
                  });
                });
                return tabs;
              })
              .then((_tabData) => _tabData.map((_tab) => _tab.tabId))
              .then(browser.tabs.remove, print.failure_stash_tabs_remove)
              .catch(print.failure_stash_tabs)
          },
        },
        window: {
          content: "window",
          description: "window",
          action: (_args) => { /*IDEA: default action for window config value*/ },
          "%": {
            content: "%",
            description: "expand to % of screen",
            action: (_args) => {
              return Promise.resolve(_args)
                .then((args) => ({
                  top: 0,
                  height: window.screen.height,
                  width: Math.floor(window.screen.width * (parseInt(args[0]) / 100.0))
                }))
                .then(print.status_window_percent_width)
                .then(updateCurrent)
                .then(notify$1.success_window_percent)
                .catch(print.failure_window_percent)
            }
          },
          normalize: {
            content: "normalize",
            description: "normalize all windows to this size",
            action: (args) => {
              let currentWindow = getCurrent()
                .then((_window) => ({
                  top: _window.top,
                  left: _window.left,
                  width: _window.width,
                  height: _window.height,
                }))
                .catch(print.failure_get_current_window);

              return getAll$2()
                .then((_windows) => {
                  return _windows.map((_window) => {
                    return Promise.resolve(_window)
                      .then((__window) => browser.windows.update(
                        __window.id,
                        currentWindow
                      ))
                      .catch(print.failure_normalize_window)
                  });
                })
                .catch(print.failure_normalize_all_windows)
            }
          },
          left: {
            content: "window_left",
            description: "Fit to left side of screen",
            action: (args) => {
              return updateCurrent({
                top: 0,
                left: 0,
                width: window.screen.width / 2,
                height: window.screen.height,
              })
              .then(notify$1.success_window_left)
              .catch(notify$1.failure_window_left);
            },
          },
          right: {
            content: "window_right",
            description: "Fit to right side of screen",
            action: (args) => {
              return updateCurrent({
                top: 0,
                left: window.screen.width / 2,
                width: window.screen.width / 2,
                height: window.screen.height,
              })
              .then(notify$1.success_window_right)
              .catch(notify$1.failure_window_right);
            },
          },
          full: {
            content: "window_full",
            description: "Fit to screen",
            action: (args) => {
              return updateCurrent({
                top: 0,
                left: 0,
                width: window.screen.width,
                height: window.screen.height,
              })
              .then(notify$1.success_window_full)
              .catch(notify$1.failure_window_full);
            },
          },
          title: {
            content: "title",
            description: "set the title of the window/tab",
            action: (args) => {
              return Promise.resolve(args)
                .then(setTitle)
                .then(notify$1.success_window_title)
                .catch(print.failure_set_window_title);
            }
          },
        },
        gather: {
          content: "gather",
          description: "move input|all tabs to current|new window",
          action: (args) => {
            // args in ('all', '<domain>', <tag>, ilike <title>, type: video, audio, article)
            let tabs = Promise.resolve(args)
              .then(tabs.filter)
              .then((tabs) => tabs.map((tab) => tab.id))
              .catch(print.failure_get_filtered_tabs);

            return Promise.resolve({
              top: 0,
              left: 0,
              width: window.screen.width / 2,
              height: window.screen.height,
            })
            .then(browser.windows.create)
            .then((_window) => {
              return tabs.move(tabs, _window)
            })
            .catch(print.failure_gather)
          }
        },
        split: {
          content: "split",
          description: "split",
          action: (args) => {
            console.log("HIT ", "split", args);
            // elos split selected tile column,
            return Promise.resolve(args)
              .then(getHighlighted)
              .then((tabs) => {
                return {
                  width: Math.floor(
                    window.screen.width /
                    max(3, tabs.length + 1)
                  ),
                  tabs: tabs,
                }
              })
              .then((data) => {
                return data.tabs.map((tab) => ({
                  top: 0,
                  left: data.width * idx,
                  width: data.width,
                  height: window.screen.height,
                  tabId: tab.id,
                }))
              })
              .then((data) => {
                data.forEach((tab) => {
                  browser.windows.create(data)
                    .catch(print.failure_split_tabs);
                });
              })
              .catch(notify$1.failure_split)
          },
        },
        unload: {
          content: "unload",
          description: "unload current tabs",
          action: (args) => {
            // TODO browser.tabs.unload this/selection/tabs/window
            return Promise.resolve(args)
              .then(getHighlighted)
              .then(unloadTabs)
              // use tabs.warmup() to undo this/prime a tab
              .catch(print.failure_unload)
          }
        },
        select: {
          content: "select",
          description: "select specified tabs",
          action: (args) => {
            console.log("SELECT HIT", args);
          },
          element: {
            content: "element",
            description: "select element picker",
            action: (args) => {
              // TODO ublock origin element picker
            }
          },
          all: {
            content: "all",
            description: "select all tabs in this window",
            action: (args) => {
              browser.tabs.query({currentWindow: true }) // or windowId: windows.WINDOW_ID_CURRENT
                .then(print.status_select_tabs)
                .then((tabs) => browser.tabs.highlight(tabs))
                .then(notify$1.success_select_all)
                .catch(print.failure_select_all);
            }
          }
        },
        pin: {
          content: "pin",
          description: "manage pins in this window",
          action: (args) => {
            // const
            return Promise.resolve(args)
              .then(filter)
              .then((tabs) => tabs.map((tab) => {
                return browser.tabs.update(tab.id, {
                  pinned: true
                })
                .catch(print.failure_tab_update)
              }))
              .catch(print.failure_pin)
          },
          remove: {
            content: "remove",
            description: "remove pins from",
            action: (args) => {
              return Promise.resolve(args)
                .then(filter)
                .then((tabs) => Promise.all(tabs.map((tab) => {
                  return browser.tabs.update(tab.id, {
                    pinned: false
                  })
                  .catch(print.failure_update_tab_pinned)
                })))
                .catch(print.failure_pin_remove)
            }
          }
        },
        popout: {
          content: "popout",
          description: "popout current tab (default to left half",
          action: (args) => {
            return Promise.resolve(args)
              .then(filter)
              .then((tabs) => {
                return Promise.all(tabs.map((tab) => {
                  return browser.tabs.move({
                    tabId: tab.id,
                    windowId: _window.id,
                    top: 0,
                    left: 0,
                    width: window.screen.width / 2,
                    height: window.screen.height,
                  }).catch(print.failure_move_tab)
                }))
              })
              .catch(print.failure_gather)
          }
        },
        goto: {
          content: "goto",
          description: "goto a given tab (TBD), playing, last, tagged",
          suggestions: (args) => {
            // how to replace, augment, or otherwise stand by firefox suggestions
            // push/pop last tab
            // numbered keys for popular sites
            return Promise.resolve(args)
              .then(filter)
              .then((tabs) => {
                return tabs.map((tab) => {
                  return {
                    content: tab.url,
                    description: tab.title
                  }
                })
              })
              .catch(print.failure_goto_suggestions)
          },
          action: (args) => {
            return Promise.resolve(args)
              .then(filter)
              .then((tabs) => tabs[0])
              .then((tab) => ({tabId: tab.id, active: true}))
              .then(browser.tabs.update)
              .catch(print.failure_goto)
          }
        },
        clear: {
          content: "clear",
          description: "clear ... stash",
          stash: {
            content: "stash",
            description: "stash",
            action: (args) => {
              console.log("HIT clear history");
              const argsFilter = {
                all: () => {
                  return browser.storage.local.set({
                    stash:{}
                  })
                  // .then(() => {})
                  .catch(print.failure_stash_clear)
                },
                last: (_args) => {},
                on_sync: (_args) => {},
              };
              argsFilter[args[0]]();
            }
          },
          history: {
            content: "history",
            description: "clear history given args: tab, window, session, by domain, by timestamp",
            action: (args) => {
              console.log("HIT clear history");
              return stores.actionHistory.update((n) => [])
                .then(notify$1.success_clear_history)
                .catch(print.failure_clear_history)
            }
          },
          log: {
            content: "log",
            description: "clear eventLog",
            action: (args) => {
              console.log("HIT clear log");
              return stores.eventLog.update((n) => [])
                .then(notify$1.success_clear_log)
                .catch(print.failure_clear_log)
            }
          },
          store: {
            content: "store",
            description: "clear storage type by name",
            action: (args) => {
              console.log("HIT clear store");
              return Promise.resolve(args)
                .then((_args) => _args[0])
                .then((_param) => stores[_param].update((n) => []))
                .then(notify$1.success_clear_store)
                .catch(print.failure_clear_store);
            }
          },
        },
        save: {
          content: "save",
          description: "save",
          page: {
            content: "save page",
            description: "Renders the page with readability and sends content to remote.",
            action: (args) => {
              console.log("HIT ", "save page", args);
              // TODO render with readability?
              // TODO save full HTML
            }
          },
          video: {
            content: "save video",
            description: "Tells the remote server to download the video in this tab.",
            action: (args) => {
              console.log("HIT save_video, running doDownloadVideo", args);
              return getCurrentActive()
                .then((tab) => ({
                  uri: "api/action/download/video",
                  body: {
                    uri: tab[0].url,
                    save: true,
                    tag: args.length ? args[0] : "video"
                  }
                }))
                .then(_send)
                .then(notify$1.success_save_video)
                .catch(notify$1.failure_save_video)
            },
          },
          song: {
            content: "save song",
            description: "Tells the remote server to download the music in this tab.",
            action: (args) => {
              console.log("HIT save_audio, running doDownloadAudio", args);
              return getCurrentActive()
                .then((tab) => ({
                  uri: "api/action/download/audio",
                  body: {
                    uri: tab[0].url,
                    save: true,
                    tag: args.length ? args[0] : "audio"
                  }
                }))
                .then(_send)
                .then(notify$1.success_save_song)
                .catch(notify$1.failure_save_song);
            },
          },
          link: {
            content: "save link",
            description: "save link this tab's location with a given tag (or not)",
            action: (args) => {
              return sendLink(args ? args : 'unsorted');
            }
          },
        },
        copy: {
          content: "copy",
          description: "copy",
          tabs: {
            content: "copy tabs",
            description: "copy tabs",
            action: (args) => {
              console.log("HIT ", "copy_tabs", args);
              return Promise.resolve({})
                .then(doSelectedCopy)
                .then(CSVToJSON)
                .then(notify$1, notify$1.failure_copy_tabs)
                .catch(print.failure_copy_tabs)
            },
          },
          storage: {
            content: "copy storage",
            description: "copy to clipboard the contents of storage",
            action: (args) => {
              return browser.storage.local.get()
                .then(JSON.stringify)
                .then(updateClipboard)
                .catch(print.failure_copy_storage)
            }
          },
          target: {
            content: "copy target",
            description: "copy target",
            action: (args) => {
              console.log("HIT ", "copy_target", args);
              // selected target ON PAGE
            },
          },
        },
        control: {
          content: "control current context",
          description: "",
          play: {
            content: "play",
            description: "Play current content",
            suggestions: (args) => {},
            action: (args) => {
              return playPause()
                .then(notify$1.success_control_play)
                .catch(notify$1.failure_control_play)
            }
          },
          pause: {
            content: "pause",
            description: "Pause current content",
            suggestions: (args) => {},
            action: (args) => {
              return playPause()
                .then(notify$1.success_control_pause)
                .catch(notify$1.failure_control_pause)
            }
          },
          restart: {
            content: "restart",
            description: "Restart current content",
            suggestions: (args) => {},
            action: (args) => {
              return restart()
                .then(notify$1.success_control_restart)
                .catch(notify$1.failure_control_restart)
            }
          },
          loop: {
            content: "loop",
            description: "Toggles the current playing media to loop.",
            action: (args) => {
              return toggleLoop()
                .then(notify$1.success_control_loop)
                .catch(notify$1.failure_control_loop)
            }
          },
          mute: {
            content: "mute",
            description: "mute notifications or current/other tab",
            suggestions: (args) => {
              return args
            },
            action: (args) => {
              // playing | all
            }
          },
          cache: {
            content: "cache",
            description: "cache current playing and play offline",
            action: (_args) => {
              //
              return args
            }
          },
        },
        search: {
          content: "search",
          description: "search",
          suggestions: (_args) => {
            console.log("Searching", _args);
            const suggestionsOnEmptyResults = [{
              content: "about:blank",
              description: "no results found"
            }];
            return Promise.resolve(_args)
              .then((args) => {
                return {
                  ...args,
                  uri: "/api/location/search",
                }
              })
              .then(_fetch)
              .then((response) => {
                console.log("Got search response", response);
                return response.results.map( (obj) => {
                  return {
                    content: obj.uri,
                    description: `[${obj.tag}] ${obj.label}`,
                  };
                });
              })
              .catch(print.failure_search)
              // .then(err => suggestionsOnEmptyResults);
          },
          action: (args) => {
            console.log("HIT ", "search", args);
            return browser.tabs.create({
              active: true,
              url: args.url
            })
            .catch(print.failure_search_open)
          }
        },
        find: {
          content: "find",
          description: "find in tabs",
          // option: open find results in new "tab" or panel
          // option: show suggestions with tabs containing criteria
          //  - suggestions have tab name and matched criteria/surrounding
          suggestions: (args) => {
            return find.findInAll(args);
          },
          action: (args) => {
          }
        },
        config: {
          content: "config",
          description: "config",
          action: (args) => {
            console.log("HIT ", "config", args);
            /*
            TODO config items passable to args
            - remote url
            - defaults format/list for suggestions
            - defaults for open in new window
            - defaults for stash
              - keep window group: T/F (in stash structure, so { window1: [tab1...]} rather than [tab..., tab1, tab2..., tabn, ...])
            - default use bookmarks or cache or remote for data lookup
            - default ordering for article queue
            - default ordering for current courses
            - default panels shown
            */
            return Promise.resolve(args)
              .then((_args) => _args.split(" ").slice(1))
              .then((args) => {
                // command shortcut, remote uri, color pallete
                if (!args || args.length === 0 || args[0] === 'open') {

                }
                else if (args[0] === "remote") {
                  console.log("UPDATING REMOTE TARGET:", args, args);
                  //
                }
                return [args, args];
              })
              .then((_args) => {
                return [..._args,
                  // stores.config.update((n) => {...n, remote: args[1]})
                ];
              })
              .then(notify$1.success_config)
              .catch(notify$1.failure_config)
          },
        },
        tag: {
          content: "tag",
          description: "add this tab's location with a given tag (or none)",
          action: (args) => {
            // return sendLink(args ? args : 'unsorted');
            return getCurrentActive()
              .then((tab) => {
                // let tag = (args && args.length > 0) ? args[1] : 'unsorted'; // TODO make this default the calendar day or something
                // let store = stores[tag];
                // stores[args[1]]
              })
              .catch(print.failure_tag);
          }
        },
        set: {
          content: "set",
          description: "Set tag for this window or tab.",
          tag: {
            action: (args) => {
              console.log("HIT ", "set tag", args);
              return getCurrentActive()
                .then((tab) => {
                  // browser.sessions.removeTabValue(tabId, key)
                  browser.sessions.setTabValue(tab.id, args[1]);
                })
                .catch(print.failure);
            },
          },
          group: {
            action: (args) => {
              console.log("HIT ", "set group", args);
              return getCurrentActive()
                .then((tab) => {
                  // browser.sessions.removeTabValue(tabId, key)
                  browser.sessions.setTabValue(tab.id, args[1]);
                })
                .catch(print.failure);
            },
          }
        },
        panel: {
          content: "panel",
          description: "panel actions by name",
          suggestions: (args) => {
            return Promise.resolve(args)
              .then(() => {
                return Object.keys(panelTypes).map((panelName) => "-".join(panelName.split("-").slice(1)))
              })
              .then(print.success_panel_suggestions)
              .catch(print.failure_panel_suggestions)
          },
          pin: {
            content: "pin",
            description: "pin",
            action: (args) => {}
          },
          shift: {
            content: "shift",
            description: "shift",
            up: {
              content: "shift up",
              description: "shift up",
              action: (args) => {}
            },
            down: {
              content: "shift down",
              description: "shift down",
              action: (args) => {}
            },
          },
          close: {
            content: "close",
            description: "panel.close alias to close.panel",
            action: (args) => {}
          },
          horizontal: {
            content: "horizontal",
            description: "max/shrink horizontal",
            action: (args) => {}
          },
        },
        open: {
          content: "open",
          description: "Opens something [root] (TODO show default action)",
          action: (args) => {
            console.log("HIT ", "open", args);
            // TODO console, options, sidebar, set default in config
            /*
            package: index, current, mark_as_completed, next, reset
            */
          },
          options: {
            content: "options",
            description: "open the plugin options as a tab",
            action: (args) => {
              return browser.runtime.openOptionsPage()
                .catch(print.failure_open_options);
            }
          },
          tab: {
            content: "tab",
            description: "open the plugin tab as a tab",
            action: (args) => {
              return browser.tabs.create({"url": "/index.html"})
                .catch(print.failure_open_options);
            }
          },
          sidebar: {
            content: "sidebar",
            description: "open the plugin sidebar as a tab",
            action: (args) => {
              // TODO sidebar: all, timer, actionmenu
              return browser.sidebarAction.open()
                .catch(print.failure_open_sidebar);
            }
          },
          group: {
            // TODO tie in data stores for autocomplete suggestions
            content: "panel",
            description: "open a group of tabs, tagged with param(s)",
            action: (args) => {
              // return browser.runtime.
            }
          },
          panel: {
            // TODO tie in data stores for autocomplete suggestions
            content: "panel",
            description: "open a panel (and TODO move to top?) in the sidebar for this window",
            action: (args) => {
              // return browser.runtime.
            }
          },
          console: {
            content: "console",
            description: "open the plugin console as a tab",
            action: (args) => {
              return browser.tabs.create({
                url: `about:devtools-toolbox?id=${browser.runtime.id}%40temporary-addon&type=extension`,
                active: true,
                title: "console |"
              })
            }
          },
        },
        close: {
          content: "close",
          description: `Close all sidebars, tagged group, tabs with url / domain / partial match`,
          action: (args) => {
            // Close all sidebars, tagged group, tabs with url / domain / partial match
            // incognito window(s)
            return args;
          },
          sidebar: {
            content: "sidebar",
            description: "Close the sidebar.",
            action: (args) => {
              // TODO sidebar: all, timer, actionmenu
              // FIXME "sidebarAction.close may only be called from a user input handler"
              return browser.sidebarAction.close()
                .catch(print.failure_close_sidebar);
            }
          },
        },
        track: {
          content: "track",
          description: "track",
          add: {
            content: "track_add",
            description: "track_add",
            action: (args) => { console.log("HIT ", "track_add", args);},
          },
          show_as: {
            content: "track_show_as",
            description: "track_show_as",
            action: (args) => { console.log("HIT ", "track_show_as", args);},
          },
        },
        timer: {
          content: "timer",
          description: "timer",
          suggestions: (args) => {
            console.log("HIT ", "timer", args);
            return Promise.resolve(args)
              // .then((_args) => {
              //   return Promise.all(stores.timers.map((timer) => {
              //     let _timer = get(timer);
              //     return {
              //       content: `${_timer.name}`,
              //       description: `${_timer.name} (${_timer.currentTime()})`,
              //     }
              //   }))
              // })
              .catch(print.failure_timer)
          },
          action: (args) => {
            console.log("HIT ", "timer", args);
            return Promise.resolve(args)
              .then((_args) => {
                // stores.timers.map((timer) => {})
              })
              .catch(print.failure_timer)
          },
          start: {
            content: "timer_start",
            description: "timer_start",
            action: (args) => { console.log("HIT ", "timer_start", args);},
          },
          pause: {
            content: "timer_pause",
            description: "timer_pause",
            action: (args) => { console.log("HIT ", "timer_pause", args);},
          },
          reset: {
            content: "timer_reset",
            description: "timer_reset",
            action: (args) => { console.log("HIT ", "timer_reset", args);},
          },
          lap: {
            content: "timer_lap",
            description: "timer_lap",
            action: (args) => { console.log("HIT ", "timer_lap", args);},
          },
        },
        help: {
          content: "help",
          description: "help",
          changelog: {
            content: "help_changelog",
            description: "help_changelog",
            action: (args) => { console.log("HIT ", "help_changelog", args);},
          },
          documentation: {
            content: "help_documentation",
            description: "help_documentation",
            action: (args) => { console.log("HIT ", "help_documentation", args);},
          },
          check_for_updates: {
            content: "help_check_for_updates",
            description: "help_check_for_updates",
            action: (args) => { console.log("HIT ", "help_check_for_updates", args);},
          },
          worker_status: {
            content: "help_worker_status",
            description: "help_worker_status",
            action: (args) => { console.log("HIT ", "help_worker_status", args);},
          },
        },
        bookmarks: {
          content: "bookmarks",
          description: "bookmarks",
          import: {
            content: "import",
            description: "import",
            action: (args) => {
              console.log("HIT ", "storage", args);
              // elos storage selected tile column,
              return Promise.resolve(args)
                .then((_args) => {})
                .catch(notify$1.failure_bookmarks_import)
            }
          },
          export: {
            content: "export",
            description: "export",
            action: (args) => {
              // save off bookmarks as a flat json array
              return getAll$1()
                // .then(storage.sync)
                .then((bookmarks) => {})
                .catch(notify$1.failure_bookmarks_export)
            }
          },
        },
        bookmarks: {
          content: "bookmarks",
          description: "bookmarks",
          import: {
            content: "import",
            description: "import",
            action: (params) => {
              console.log("HIT ", "storage", params);
              // elos storage selected tile column,
              return Promise.resolve(params)
                .then((_params) => {

                })
                .catch(notify.failure_bookmarks_import)
            }
          },
          export: {
            content: "export",
            description: "export",
            action: (params) => {
              // save off bookmarks as a flat json array
              return getAll$1()
                // .then(syncStorage)
                .then((bookmarks) => {})
                .catch(notify.failure_bookmarks_export)
            }
          },
        },
        history: {
          content: "history",
          description: "history",
          last: {
            content: "history_last",
            description: "history_last",
            action: (args) => {
              console.log("HIT ", "history_last_actions", args);

            },
          },
          undo: {
            content: "history_undo",
            description: "history_undo",
            action: (args) => { console.log("HIT ", "history_undo_close", args);},
          },
        },
        convert: {
          content: "convert",
          description: "convert",
          csv_to_json: {
            content: "convert_csv_to_json",
            description: "convert_csv_to_json",
            action: (args) => { console.log("HIT ", "convert_csv_to_json", args);},
          },
          json_to_csv: {
            content: "convert_json_to_csv",
            description: "convert_json_to_csv",
            action: (args) => { console.log("HIT ", "convert_json_to_csv", args);},
          },
        },
        package: {
          content: "package",
          description: "package",
          action: (args) => {
            console.log("HIT ", "package", args);
            /*
              add:
                channel
                index
              create:
                package
              discover
              install:
                package
              list:
                channel
                index
                installed
              remove:
                channel
                index
              search
              set:
                debug
              uninstall:
                package
              update:
                channel
                index
                package
            */
          },
        }
      };
    }
    catch (err) {
      print.failure_omnibox(err);
    }

    const cmds = _cmds;
    console.log('cmds', cmds);

    console.log("LOADING ELOS CONNECT - background.js");

    // ------ GLOBAL ERRORS

    {
      if (browser.runtime.lastError) {
        let err = browser.runtime.lastError;
        Promise.resolve({
          title: `browser.runtime lastError: ${err.name}`,
          message: err.message
          // buttons: ['retry', 'close']
        })
        .then(notify$1.received_global_errors)
        .catch(print.failure_global_errors);
      }
    }


    // ------ MESSAGING

    // const handleMessage = (request, sender, sendResponse) => {
    const handleMessage = (message) => {
      print.status_background_got_message(message);
      // TODO setup message handling and routing here
      if (message.action === "set.readerMode") {
        // Toggle Reader Mode
        return Promise.resolve(message)
          .then(browser.readerMode.toggleReaderMode)
          .then(_ => ({ active: true, currentWindow: true }))
          .then(browser.tabs.query)
          .then(_tabs => _tabs[0].id)
          .then(tabId => browser.tabs.sendMessage(tabId, { action: "set.readerMode" }))
          .catch(print.failure_set_readermode)
      } else if (message.action === "processMarkdown") {
        return Promise.resolve(message)
          .then(msg => msg.markdown)
          .then(mkdown => ({
            body: mkdown
          }))
          .then(_send)
          .catch(print.failure_process_markdown)
      }
    };

    const updateTab = (tabId, changeInfo, tab) => {
      return Promise.resolve(tab)
        .then(print.status_background_updating_tab)
        .then(_tab => ({
          name: tab.id,
          tabId: tab.id,
          windowId: tab.windowId,
          muted: tab.mutedInfo.muted,
          title: tab.title,
          url: tab.url,
          playing: tab.audible,
          article: tab.isArticle,
          changed: changeInfo
        }))
        .then(browser.runtime.sendMessage)
        .then(print.success_update_tab)
        .catch(print.failure_update_tab);
    };

    // ------ COMMAND SEARCH

    let lastInput = ""; // hack cache to move the whole input to the actuation

    const renderSuggestions = (_cmds) => {
      return Promise.resolve(_cmds)
        // .then((tree) => tree.filter((cmdList, node) => cmdList, {}))
        .then((cmd) => {
          let tree = cmd[0];
          let args = cmd[1];
          if (tree.suggestions) {
            return tree.suggestions(args);
          } else if (
            Array.isArray(tree) &&
            tree.length > 0 &&
            tree[0].suggestions
          ) {
            return tree[0].suggestions(args);
          } else if (Array.isArray(tree)) {
            return tree;
          } else {
            return [tree].flat(1);
          }
        })
        .then((suggestions) => {
          return suggestions.reduce((result, item) => {
            let _content = item.content;
            if (_content) {
              result.push({
                content: _content,
                description: item.description,
              });
            }
            const entryKeys = ['content','description','action','suggestions'];
            Object.entries(item).forEach((_entry) => {
              if (entryKeys.indexOf(_entry[0]) != -1) {
                return
              }
              result.push({
                content: _entry[1].content,
                description: _entry[1].description
              });
            });
            return result;
          }, []);
        })
        .catch(print.failure_render_suggestions);
    };

    const findCommands = (_input) => {
      let parts = _input.toLowerCase().split(" ");
      let cursor = cmds;
      let args = null;
      parts.forEach((part, idx) => {
        let _cursor = cursor[part];
        if (_cursor) {
          cursor = _cursor;
        } else if (!args) {
          args = idx; // grab the slice at args, not just the part
        }
        // console.log("[CHANGED] cursor:", cursor, args);
      });
      args = args ? parts.slice(args) : null;
      // console.log("[END] cursor:", cursor, args);
      return [cursor, args];
    };

    const omniboxOnInputChanged = (text, addSuggestions) => {
      // console.log("CHANGED", lastInput, ", BECAME:", text);
      lastInput = text;
      if (lastInput && lastInput.length == 0) ;

      try {
        return Promise.resolve(lastInput)
          .then(findCommands)
          .then(renderSuggestions)
          .then(addSuggestions)
          .catch(print.failure_omnibox_changed);
      }
      catch (err) {
        console.log(err);
        return Promise.reject(err);
      }
    };

    const omniboxOnInputStarted = (params) => {
      console.log("User has started interacting with me.", params);
      lastInput = "";
    };

    const registerHistory = (event) => {
      return Promise.resolve(event)
        .then(print.status_register_history)
        .then(_event => {
            return (n) => [
              ...n,
              {
                event: _event,
                timestamp: new Date(),
              }
            ]
        })
        .then(stores.actionHistory.update)
        .catch(print.failure_register_history);
    };

    const renderAction = (_input) => {
      return Promise.resolve(_input)
        .then(findCommands)
        // FIXME if _input is partial (like "syn", down arrow, enter)
        //       then check if results are OKAY,
        //       else process from input, not lastInput
        .then(print.status_render_action)
        .then((_cmds) => _cmds[0].action(_cmds[1]))
        .catch(print.failure_render_action);
    };

    const omniboxOnInputEntered = (input, disposition) => {
      // console.log("INPUT SUBMITTED", lastInput, '--', input, '--', cmds[input]);
      return Promise.resolve(lastInput)
        .then(print.status_on_input_entered)
        .then(registerHistory)
        .then(renderAction)
        .then(print.success_on_input_entered)
        .catch(print.failure_omnibox_entered);
    };

    const omniboxOnInputCancelled = () => {
      resetOmnibox();
    };


    // ------ websocket to server --- In background.js

    // // Connect to the websocket
    // const socket = new WebSocket('ws://localhost:5000/ws');

    // // Add a context menu item
    // browser.contextMenus.create({
    //   id: 'process-link',
    //   title: 'Process link',
    //   contexts: ['link'],
    // });

    // // Add an event listener for when the context menu item is clicked
    // browser.contextMenus.onClicked.addListener((info, tab) => {
    //   if (info.menuItemId === 'process-link') {
    //     // Send the link over the websocket
    //     socket.send(JSON.stringify({
    //       action: 'process_link',
    //       link: info.linkUrl,
    //     }));
    //   }
    // });

    // -------------------


    const commandAction = (name) => {
      return Promise.resolve(name)
        .then(renderAction)
        .then(print.success_command_action)
        .catch(print.failure_command_action)
    };

    // --------

    class CommandContextMenu {
      constructor(command) {
        this.command = command;
      }

      onClick(info, tab) {
        this.command.action();
      }

      create() {
        return {
          id: this.command.content,
          title: this.command.content,
          contexts: ["browser_action"],
          onclick: this.onClick,
        };
      }
    }

    class CommandsContextMenu {
      constructor(commands) {
        this.commands = commands;
      }

      create() {
        return Object.values(this.commands).map(
          (command) => new CommandContextMenu(command).create()
        );
      }
    }


    // ----

    try {
      print.success_background_js_mounted();

      // let params = {
      //   name: `sidebar-${browser.windows.getCurrent().id}`,
      //   debug: true,
      //   handler: (args) => console.log("[HANDLER][MESSAGE][RECEIVE]", args),
      // };
      // params.postMessage = setupRelay(params);

      // GENERAL MESSAGE HANDLER
      browser.runtime.onMessage.addListener(handleMessage);

      // WATCH FOR PROPERTY CHANGES
      browser.tabs.onUpdated.addListener(updateTab, {
        properties: ["audible"], // , "hidden", "mutedInfo", "url"
        // tabId: tabId
      });

      // OMNIBOX START
      browser.omnibox.setDefaultSuggestion({
        description: "this is a limited eLOS preview; v0.0.11-prealpha"
      });

      browser.omnibox.onInputStarted.addListener(omniboxOnInputStarted);
      browser.omnibox.onInputChanged.addListener(omniboxOnInputChanged);
      browser.omnibox.onInputEntered.addListener(omniboxOnInputEntered);
      browser.omnibox.onInputCancelled.addListener(omniboxOnInputCancelled);

      // browser.runtime.onInstalled.addListener(setThemeContext);
      browser.commands.onCommand.addListener(commandAction);
      // browser.runtime.onSuspend.addListener(omniboxOnInputCancelled);

      // OMNIBOX END


      // CONTEXT MENUS
      browser.contextMenus.create({
        id: "root",
        title: "WebExtension Commands",
        contexts: ["browser_action"],
      });

      const contextMenus = new CommandsContextMenu(cmds);
      contextMenus.create().forEach((menu) => {
        browser.contextMenus.create(menu);
      });

    } catch (e) {
      console.log("Caught background.js init error", e);
    }

    exports.registerHistory = registerHistory;
    exports.renderAction = renderAction;
    exports.renderSuggestions = renderSuggestions;
    exports.updateTab = updateTab;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=background.js.map
