// main cli command structure


import { panelTypes } from "../config/panels.js";

import * as bookmarks from "./apis/bookmarks.js";
import * as files from "./apis/files.js";
import * as proxy from "./apis/proxy.js";
import * as reduce from "./apis/reduce.js";
import * as storage from "./apis/storage.js";
import * as tabs from "./apis/tabs.js";
import * as windows from "./apis/windows.js";

import * as actions from "./actions.js";
import * as network from "./network.js";
import * as send from "./send.js";
import { stores } from "./stores.js";

proxy.print.load_omnibox();

let _cmds = {};
try {
  _cmds = {
    reload: {
      content: "reload",
      description: "reload plugin",
      action: (args) => actions.reloadSystem()
        .then(proxy.notify.success_reload)
        .catch(proxy.notify.failure_reload)
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
          .then(storage.sync)
          .then(proxy.notify.success_sync)
          .catch(proxy.print.failure_sync);
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
          .then((_window) => tabs.getAll({window: _window.id}))
          .then(_tabs => tabs.move(_tabs))
          .then(proxy.notify.success_move)
          .catch(proxy.print.failure_move)
      }
    },
    watch: {
      content: "watch",
      description: "Watch selected field for changes",
      action: (args) => {
        console.log("MOVE")
        let _tag = args.length > 1 ? args.slice(1) : ['selection'];
        return Promise.resolve([...args, ..._tag])
          // .then(tabs.getQueried)
          // .then(tabs.getQueriedTag)
          // TODO add tab listeners for type of watcher (this is a major feature)
          .catch(proxy.print.failure_watch)
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
          .catch(proxy.print.failure_stash_suggestions)
          .then(() => [{
            content: "No stash found.",
            description: "No stash found.",
          }]);
      },
      action: (args) => {
        // args: null, "this", "window", "all"
        return Promise.resolve(args)
          .then(tabs.getQueried)
          .then(Promise.all)
          .then((__tabs) => __tabs.flat(1))
          .then((tabs) => {
            tabs.forEach((tab) => {
              if (!tab.tag || tab.tag === "unsorted") {
                tab.tag = _tag;
              }
              bookmarks.create({
                title: tab.title,
                url: tab.url,
                parentId: "stash"
              });
            });
            return tabs;
          })
          .then((_tabData) => _tabData.map((_tab) => _tab.tabId))
          .then(browser.tabs.remove, proxy.print.failure_stash_tabs_remove)
          .catch(proxy.print.failure_stash_tabs)
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
            .then(proxy.print.status_window_percent_width)
            .then(windows.updateCurrent)
            .then(proxy.notify.success_window_percent)
            .catch(proxy.print.failure_window_percent)
        }
      },
      normalize: {
        content: "normalize",
        description: "normalize all windows to this size",
        action: (args) => {
          let currentWindow = windows.getCurrent()
            .then((_window) => ({
              top: _window.top,
              left: _window.left,
              width: _window.width,
              height: _window.height,
            }))
            .catch(proxy.print.failure_get_current_window);

          return windows.getAll()
            .then((_windows) => {
              return _windows.map((_window) => {
                return Promise.resolve(_window)
                  .then((__window) => browser.windows.update(
                    __window.id,
                    currentWindow
                  ))
                  .catch(proxy.print.failure_normalize_window)
              });
            })
            .catch(proxy.print.failure_normalize_all_windows)
        }
      },
      left: {
        content: "window_left",
        description: "Fit to left side of screen",
        action: (args) => {
          return windows.updateCurrent({
            top: 0,
            left: 0,
            width: window.screen.width / 2,
            height: window.screen.height,
          })
          .then(proxy.notify.success_window_left)
          .catch(proxy.notify.failure_window_left);
        },
      },
      right: {
        content: "window_right",
        description: "Fit to right side of screen",
        action: (args) => {
          return windows.updateCurrent({
            top: 0,
            left: window.screen.width / 2,
            width: window.screen.width / 2,
            height: window.screen.height,
          })
          .then(proxy.notify.success_window_right)
          .catch(proxy.notify.failure_window_right);
        },
      },
      full: {
        content: "window_full",
        description: "Fit to screen",
        action: (args) => {
          return windows.updateCurrent({
            top: 0,
            left: 0,
            width: window.screen.width,
            height: window.screen.height,
          })
          .then(proxy.notify.success_window_full)
          .catch(proxy.notify.failure_window_full);
        },
      },
      title: {
        content: "title",
        description: "set the title of the window/tab",
        action: (args) => {
          return Promise.resolve(args)
            .then(windows.setTitle)
            .then(proxy.notify.success_window_title)
            .catch(proxy.print.failure_set_window_title);
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
          .catch(proxy.print.failure_get_filtered_tabs)

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
        .catch(proxy.print.failure_gather)
      }
    },
    split: {
      content: "split",
      description: "split",
      action: (args) => {
        console.log("HIT ", "split", args);
        // elos split selected tile column,
        return Promise.resolve(args)
          .then(tabs.getHighlighted)
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
                .catch(proxy.print.failure_split_tabs);
            })
          })
          .catch(proxy.notify.failure_split)
      },
    },
    unload: {
      content: "unload",
      description: "unload current tabs",
      action: (args) => {
        // TODO browser.tabs.unload this/selection/tabs/window
        return Promise.resolve(args)
          .then(tabs.getHighlighted)
          .then(actions.unloadTabs)
          // use tabs.warmup() to undo this/prime a tab
          .catch(proxy.print.failure_unload)
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
            .then(proxy.print.status_select_tabs)
            .then((tabs) => browser.tabs.highlight(tabs))
            .then(proxy.notify.success_select_all)
            .catch(proxy.print.failure_select_all);
        }
      }
    },
    pin: {
      content: "pin",
      description: "manage pins in this window",
      action: (args) => {
        // const
        return Promise.resolve(args)
          .then(tabs.filter)
          .then((tabs) => tabs.map((tab) => {
            return browser.tabs.update(tab.id, {
              pinned: true
            })
            .catch(proxy.print.failure_tab_update)
          }))
          .catch(proxy.print.failure_pin)
      },
      remove: {
        content: "remove",
        description: "remove pins from",
        action: (args) => {
          return Promise.resolve(args)
            .then(tabs.filter)
            .then((tabs) => Promise.all(tabs.map((tab) => {
              return browser.tabs.update(tab.id, {
                pinned: false
              })
              .catch(proxy.print.failure_update_tab_pinned)
            })))
            .catch(proxy.print.failure_pin_remove)
        }
      }
    },
    popout: {
      content: "popout",
      description: "popout current tab (default to left half",
      action: (args) => {
        return Promise.resolve(args)
          .then(tabs.filter)
          .then((tabs) => {
            return Promise.all(tabs.map((tab) => {
              return browser.tabs.move({
                tabId: tab.id,
                windowId: _window.id,
                top: 0,
                left: 0,
                width: window.screen.width / 2,
                height: window.screen.height,
              }).catch(proxy.print.failure_move_tab)
            }))
          })
          .catch(proxy.print.failure_gather)
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
          .then(tabs.filter)
          .then((tabs) => {
            return tabs.map((tab) => {
              return {
                content: tab.url,
                description: tab.title
              }
            })
          })
          .catch(proxy.print.failure_goto_suggestions)
      },
      action: (args) => {
        return Promise.resolve(args)
          .then(tabs.filter)
          .then((tabs) => tabs[0])
          .then((tab) => ({tabId: tab.id, active: true}))
          .then(browser.tabs.update)
          .catch(proxy.print.failure_goto)
      }
    },
    clear: {
      content: "clear",
      description: "clear ... stash",
      stash: {
        content: "stash",
        description: "stash",
        action: (args) => {
          console.log("HIT clear history")
          const argsFilter = {
            all: () => {
              return browser.storage.local.set({
                stash:{}
              })
              // .then(() => {})
              .catch(proxy.print.failure_stash_clear)
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
          console.log("HIT clear history")
          return stores.actionHistory.update((n) => [])
            .then(proxy.notify.success_clear_history)
            .catch(proxy.print.failure_clear_history)
        }
      },
      log: {
        content: "log",
        description: "clear eventLog",
        action: (args) => {
          console.log("HIT clear log")
          return stores.eventLog.update((n) => [])
            .then(proxy.notify.success_clear_log)
            .catch(proxy.print.failure_clear_log)
        }
      },
      store: {
        content: "store",
        description: "clear storage type by name",
        action: (args) => {
          console.log("HIT clear store")
          return Promise.resolve(args)
            .then((_args) => _args[0])
            .then((_param) => stores[_param].update((n) => []))
            .then(proxy.notify.success_clear_store)
            .catch(proxy.print.failure_clear_store);
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
          return tabs.getCurrentActive()
            .then((tab) => ({
              uri: "api/action/download/video",
              body: {
                uri: tab[0].url,
                save: true,
                tag: args.length ? args[0] : "video"
              }
            }))
            .then(network._send)
            .then(proxy.notify.success_save_video)
            .catch(proxy.notify.failure_save_video)
        },
      },
      song: {
        content: "save song",
        description: "Tells the remote server to download the music in this tab.",
        action: (args) => {
          console.log("HIT save_audio, running doDownloadAudio", args);
          return tabs.getCurrentActive()
            .then((tab) => ({
              uri: "api/action/download/audio",
              body: {
                uri: tab[0].url,
                save: true,
                tag: args.length ? args[0] : "audio"
              }
            }))
            .then(network._send)
            .then(proxy.notify.success_save_song)
            .catch(proxy.notify.failure_save_song);
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
          console.log("HIT ", "copy_tabs", args)
          return Promise.resolve({})
            .then(doSelectedCopy)
            .then(reduce.CSVToJSON)
            .then(proxy.notify, proxy.notify.failure_copy_tabs)
            .catch(proxy.print.failure_copy_tabs)
        },
      },
      storage: {
        content: "copy storage",
        description: "copy to clipboard the contents of storage",
        action: (args) => {
          return browser.storage.local.get()
            .then(JSON.stringify)
            .then(actions.updateClipboard)
            .catch(proxy.print.failure_copy_storage)
        }
      },
      target: {
        content: "copy target",
        description: "copy target",
        action: (args) => {
          console.log("HIT ", "copy_target", args)
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
          return send.playPause()
            .then(proxy.notify.success_control_play)
            .catch(proxy.notify.failure_control_play)
        }
      },
      pause: {
        content: "pause",
        description: "Pause current content",
        suggestions: (args) => {},
        action: (args) => {
          return send.playPause()
            .then(proxy.notify.success_control_pause)
            .catch(proxy.notify.failure_control_pause)
        }
      },
      restart: {
        content: "restart",
        description: "Restart current content",
        suggestions: (args) => {},
        action: (args) => {
          return send.restart()
            .then(proxy.notify.success_control_restart)
            .catch(proxy.notify.failure_control_restart)
        }
      },
      loop: {
        content: "loop",
        description: "Toggles the current playing media to loop.",
        action: (args) => {
          return send.toggleLoop()
            .then(proxy.notify.success_control_loop)
            .catch(proxy.notify.failure_control_loop)
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
          .then(network._fetch)
          .then((response) => {
            console.log("Got search response", response);
            return response.results.map( (obj) => {
              return {
                content: obj.uri,
                description: `[${obj.tag}] ${obj.label}`,
              };
            });
          })
          .catch(proxy.print.failure_search)
          // .then(err => suggestionsOnEmptyResults);
      },
      action: (args) => {
        console.log("HIT ", "search", args);
        return browser.tabs.create({
          active: true,
          url: args.url
        })
        .catch(proxy.print.failure_search_open)
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
        console.log("HIT ", "config", args)
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
          .then(proxy.notify.success_config)
          .catch(proxy.notify.failure_config)
      },
    },
    tag: {
      content: "tag",
      description: "add this tab's location with a given tag (or none)",
      action: (args) => {
        // return sendLink(args ? args : 'unsorted');
        return tabs.getCurrentActive()
          .then((tab) => {
            // let tag = (args && args.length > 0) ? args[1] : 'unsorted'; // TODO make this default the calendar day or something
            // let store = stores[tag];
            // stores[args[1]]
          })
          .catch(proxy.print.failure_tag);
      }
    },
    set: {
      content: "set",
      description: "Set tag for this window or tab.",
      tag: {
        action: (args) => {
          console.log("HIT ", "set tag", args);
          return tabs.getCurrentActive()
            .then((tab) => {
              // browser.sessions.removeTabValue(tabId, key)
              browser.sessions.setTabValue(tab.id, args[1]);
            })
            .catch(proxy.print.failure);
        },
      },
      group: {
        action: (args) => {
          console.log("HIT ", "set group", args);
          return tabs.getCurrentActive()
            .then((tab) => {
              // browser.sessions.removeTabValue(tabId, key)
              browser.sessions.setTabValue(tab.id, args[1]);
            })
            .catch(proxy.print.failure);
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
          .then(proxy.print.success_panel_suggestions)
          .catch(proxy.print.failure_panel_suggestions)
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
        console.log("HIT ", "open", args)
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
            .catch(proxy.print.failure_open_options);
        }
      },
      tab: {
        content: "tab",
        description: "open the plugin tab as a tab",
        action: (args) => {
          return browser.tabs.create({"url": "/index.html"})
            .catch(proxy.print.failure_open_options);
        }
      },
      sidebar: {
        content: "sidebar",
        description: "open the plugin sidebar as a tab",
        action: (args) => {
          // TODO sidebar: all, timer, actionmenu
          return browser.sidebarAction.open()
            .catch(proxy.print.failure_open_sidebar);
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
            .catch(proxy.print.failure_close_sidebar);
        }
      },
    },
    track: {
      content: "track",
      description: "track",
      add: {
        content: "track_add",
        description: "track_add",
        action: (args) => { console.log("HIT ", "track_add", args)},
      },
      show_as: {
        content: "track_show_as",
        description: "track_show_as",
        action: (args) => { console.log("HIT ", "track_show_as", args)},
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
          .catch(proxy.print.failure_timer)
      },
      action: (args) => {
        console.log("HIT ", "timer", args);
        return Promise.resolve(args)
          .then((_args) => {
            // stores.timers.map((timer) => {})
          })
          .catch(proxy.print.failure_timer)
      },
      start: {
        content: "timer_start",
        description: "timer_start",
        action: (args) => { console.log("HIT ", "timer_start", args)},
      },
      pause: {
        content: "timer_pause",
        description: "timer_pause",
        action: (args) => { console.log("HIT ", "timer_pause", args)},
      },
      reset: {
        content: "timer_reset",
        description: "timer_reset",
        action: (args) => { console.log("HIT ", "timer_reset", args)},
      },
      lap: {
        content: "timer_lap",
        description: "timer_lap",
        action: (args) => { console.log("HIT ", "timer_lap", args)},
      },
    },
    help: {
      content: "help",
      description: "help",
      changelog: {
        content: "help_changelog",
        description: "help_changelog",
        action: (args) => { console.log("HIT ", "help_changelog", args)},
      },
      documentation: {
        content: "help_documentation",
        description: "help_documentation",
        action: (args) => { console.log("HIT ", "help_documentation", args)},
      },
      check_for_updates: {
        content: "help_check_for_updates",
        description: "help_check_for_updates",
        action: (args) => { console.log("HIT ", "help_check_for_updates", args)},
      },
      worker_status: {
        content: "help_worker_status",
        description: "help_worker_status",
        action: (args) => { console.log("HIT ", "help_worker_status", args)},
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
            .catch(proxy.notify.failure_bookmarks_import)
        }
      },
      export: {
        content: "export",
        description: "export",
        action: (args) => {
          // save off bookmarks as a flat json array
          return bookmarks.getAll()
            // .then(storage.sync)
            .then((bookmarks) => {})
            .catch(proxy.notify.failure_bookmarks_export)
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
          return bookmarks.getAll()
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
        action: (args) => { console.log("HIT ", "history_undo_close", args)},
      },
    },
    convert: {
      content: "convert",
      description: "convert",
      csv_to_json: {
        content: "convert_csv_to_json",
        description: "convert_csv_to_json",
        action: (args) => { console.log("HIT ", "convert_csv_to_json", args)},
      },
      json_to_csv: {
        content: "convert_json_to_csv",
        description: "convert_json_to_csv",
        action: (args) => { console.log("HIT ", "convert_json_to_csv", args)},
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
  proxy.print.failure_omnibox(err);
}

export const cmds = _cmds;
console.log('cmds', cmds);

