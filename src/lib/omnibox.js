// main cli command structure

import {
  doSelectedCopy,
  doReloadSystem,
  reduceTabs,
  findInAll,
  filterTabs,
  filterTabsBy,
  moveTabs,
  getAllTabs,
  getAllWindows,
  getCurrentWindow,
  getCurrentActiveTab,
  getHighlightedTabs,
  setWindowTitle,
  setTabActive,
  getQueriedTabs,
  tabQueries,
  syncStorage,
  sendRestart,
  sendToggleLoop,
  sendPlayPause,
  updateCurrentWindow,
  updateClipboard,
  _fetch,
  _send,
  notify,
  print,
} from "./apis.js";
import { stores } from "./stores.js";
import { panelTypes } from "../config/panels.js";

print.load_omnibox();

let _cmds = {};
try {
  _cmds = {
    reload: {
      content: "reload",
      description: "reload plugin",
      action: (params) => doReloadSystem()
        .then(notify.success_reload)
        .catch(notify.failure_reload)
    },
    sync: {
      content: "sync",
      description: "sync current state with remote.",
      // suggestions: (params) => {
      //   mine: {
      //     content: "mine",
      //     description: "send mine and prefer it for value conflicts"
      //   }
      // }),
      // TODO sync push, sync pull, set default to which?
      action: (params) => {
        console.log("HIT sync", params);
        return Promise.resolve((params && params.length) ? params : undefined)
          .then(syncStorage)
          .then(notify.success_sync)
          .catch(print.failure_sync);
      },
    },
    stash: {
      content: "stash",
      description: "PARAMS: this, window, all | [tag_name]; Capture essential content in each of the selected tabs, and store with stash.",
      suggestions: (params) => {
        console.log("SUGGESTIONS", params);
        return browser.storage.local.get("stash")
          .then((result) => result.stash)
          .then((result) => Object.values(result))
          .then((_stash) => {
            return _stash.map((item) => ({
              content: item.uri,
              description: item.label
            }))
          })
          .catch(print.failure_stash_suggestions)
          .then(() => [{
            content: "No stash found.",
            description: "No stash found.",
          }]);
      },
      action: (params) => {
        console.log("HIT", "stash", params);
        // params: null, "this", "window", "all"
        let _tag = params.length > 1 ? params.slice(1) : ['unsorted'];
        let _tabs = getQueriedTabs([...params, ..._tag]);

        return browser.storage.local.get("stash")
          .then((result) => result.stash)
          .then((_stash) => _stash || [])
          .then((_stash) => {
            return Promise.all([_tabs])
              .then((__tabs) => __tabs.flat(1))
              .then((tabs) => {
                tabs.forEach((tab) => {
                  if (!tab.tag || tab.tag === "unsorted") {
                    tab.tag = _tag;
                  }
                  _stash.push(tab);
                })
                console.log("___STASH", _stash);
                return { stash: _stash };
              })
              .catch(print.failure_stash_tabs)
          })
          .then(browser.storage.local.set)
          .then(() => {
            return Promise.resolve(_tabs)
              .then((_tabData) => _tabData.map((_tab) => _tab.tabId))
              .then(browser.tabs.remove)
              .catch(print.failure_stash_tabs_remove)
          })
          .then(notify.success_stash)
          .catch(print.failure_stash)
      },
    },
    window: {
      content: "window",
      description: "window",
      action: (_params) => {
        console.log("HIT", "window", _params);
      },
      "%": {
        content: "%",
        description: "expand to % of screen",
        action: (_params) => {
          console.log("HIT", "window.%", _params);
          return Promise.resolve(_params)
            .then((params) => ({
              top: 0,
              height: window.screen.height,
              width: Math.floor(window.screen.width * (parseInt(params[0]) / 100.0))
            }))
            .then(print.status_window_percent_width)
            .then(updateCurrentWindow)
            .then(notify.success_window_percent)
            .catch(print.failure_window_percent)
        }
      },
      normalize: {
        content: "normalize",
        description: "normalize all windows to this size",
        action: (params) => {
          let currentWindow = getCurrentWindow()
            .then((_window) => ({
              top: _window.top,
              left: _window.left,
              width: _window.width,
              height: _window.height,
            }))
            .catch(print.failure_get_current_window);

          return getAllWindows()
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
        action: (params) => {
          return updateCurrentWindow({
            top: 0,
            left: 0,
            width: window.screen.width / 2,
            height: window.screen.height,
          })
          .then(notify.success_window_left)
          .catch(notify.failure_window_left);
        },
      },
      right: {
        content: "window_right",
        description: "Fit to right side of screen",
        action: (params) => {
          return updateCurrentWindow({
            top: 0,
            left: window.screen.width / 2,
            width: window.screen.width / 2,
            height: window.screen.height,
          })
          .then(notify.success_window_right)
          .catch(notify.failure_window_right);
        },
      },
      full: {
        content: "window_full",
        description: "Fit to screen",
        action: (params) => {
          return updateCurrentWindow({
            top: 0,
            left: 0,
            width: window.screen.width,
            height: window.screen.height,
          })
          .then(notify.success_window_full)
          .catch(notify.failure_window_full);
        },
      },
      title: {
        content: "title",
        description: "set the title of the window/tab",
        action: (params) => {
          console.log("HIT", "title", params);
          return Promise.resolve(params)
            .then(setWindowTitle)
            .then(notify.success_window_title)
            .catch(print.failure_set_window_title);
        }
      },
    },
    gather: {
      content: "gather",
      description: "move input|all tabs to current|new window",
      action: async (params) => {
        console.log("HIT", "gather", params);
        // params in ('all', '<domain>', <tag>, ilike <title>, type: video, audio, article)
        let tabs = Promise.resolve(params)
          .then(filterTabs)
          .then((tabs) => tabs.map((tab) => tab.id))
          .catch(print.failure_get_filtered_tabs)

        return Promise.resolve({
          top: 0,
          left: 0,
          width: window.screen.width / 2,
          height: window.screen.height,
        })
        .then(browser.windows.create)
        .then((_window) => {
          return moveTabs(tabs, _window)
        })
        .catch(print.failure_gather)
      }
    },
    select: {
      content: "select",
      description: "select specified tabs",
      action: (params) => {
        console.log("SELECT HIT", params);
      },
      all: {
        content: "all",
        description: "select all tabs in this window",
        action: (params) => {
          browser.tabs.query({currentWindow: true }) // or windowId: windows.WINDOW_ID_CURRENT
            .then(print.status_select_tabs)
            .then((tabs) => browser.tabs.highlight(tabs))
            .then(notify.success_select_all)
            .catch(print.failure_select_all);
        }
      }
    },
    pin: {
      content: "pin",
      description: "manage pins in this window",
      action: (params) => {
        // const
        return Promise.resolve(params)
          .catch(print.failure_pin)
      },
      remove: {
        content: "remove",
        description: "remove pins from",
        action: (params) => {

        }
      }
    },
    popout: {
      content: "popout",
      description: "popout current tab (default to left half",
      action: (params) => {
        return Promise.resolve(params)
          .then(filterTabs)
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
      suggestions: (params) => {
        // how to replace, augment, or otherwise stand by firefox suggestions
        // push/pop last tab
        // numbered keys for popular sites
        return Promise.resolve(params)
          .then(filterTabs)
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
      action: (params) => {
        return Promise.resolve(params)
          .then(filterTabs)
          .then((tabs) => tabs[0])
          .then((tab) => ({tabId: tab.id, active: true}))
          .then(browser.tabs.update)
          .catch(print.failure_goto)
      }
    },
    clear: {
      content: "clear",
      description: "clear",
      stash: {
        content: "stash",
        description: "stash",
        action: (params) => {
          console.log("HIT clear history")
          const paramsFilter = {
            all: () => {
              return browser.storage.local.set({
                stash:{}
              })
              // .then(() => {})
              .catch(print.failure_stash_clear)
            },
            last: (_params) => {},
            on_sync: (_params) => {},
          };
          paramsFilter[params[0]]();
        }
      },
      history: {
        content: "history",
        description: "clear history given params: tab, window, session, by domain, by timestamp",
        action: (params) => {
          console.log("HIT clear history")
          return stores.actionHistory.update((n) => [])
            .then(notify.success_clear_history)
            .catch(print.failure_clear_history)
        }
      },
      log: {
        content: "log",
        description: "clear eventLog",
        action: (params) => {
          console.log("HIT clear log")
          return stores.eventLog.update((n) => [])
            .then(notify.success_clear_log)
            .catch(print.failure_clear_log)
        }
      },
      store: {
        content: "store",
        description: "clear storage type by name",
        action: (params) => {
          console.log("HIT clear store")
          return Promise.resolve(params)
            .then((_params) => _params[0])
            .then((_param) => stores[_param].update((n) => []))
            .then(notify.success_clear_store)
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
        action: (params) => {
          console.log("HIT ", "save page", params);
          // TODO render with readability?
          // TODO save full HTML
        }
      },
      video: {
        content: "save video",
        description: "Tells the remote server to download the video in this tab.",
        action: (params) => {
          console.log("HIT save_video, running doDownloadVideo", params);
          return getCurrentActiveTab()
            .then((tab) => ({
              uri: "api/action/download/video",
              body: {
                uri: tab[0].url,
                save: true,
                tag: params.length ? params[0] : "video"
              }
            }))
            .then(_send)
            .then(notify.success_save_video)
            .catch(notify.failure_save_video)
        },
      },
      song: {
        content: "save song",
        description: "Tells the remote server to download the music in this tab.",
        action: (params) => {
          console.log("HIT save_audio, running doDownloadAudio", params);
          return getCurrentActiveTab()
            .then((tab) => ({
              uri: "api/action/download/audio",
              body: {
                uri: tab[0].url,
                save: true,
                tag: params.length ? params[0] : "audio"
              }
            }))
            .then(_send)
            .then(notify.success_save_song)
            .catch(notify.failure_save_song);
        },
      },
      link: {
        content: "save link",
        description: "save link this tab's location with a given tag (or not)",
        action: (params) => {
          return sendLink(params ? params : 'unsorted');
        }
      },
    },
    copy: {
      content: "copy",
      description: "copy",
      tabs: {
        content: "copy tabs",
        description: "copy tabs",
        action: (params) => {
          console.log("HIT ", "copy_tabs", params)
          return Promise.resolve({})
            .then(doSelectedCopy)
            .then(notify, notify.failure)
            .catch(print.failure_copy_tabs)
        },
      },
      storage: {
        content: "copy storage",
        description: "copy to clipboard the contents of storage",
        action: (params) => {
          console.log("HIT", "copy_storage", params);
          return browser.storage.local.get()
            .then(JSON.stringify)
            .then(updateClipboard)
            .catch(print.failure_copy_storage)
        }
      },
      target: {
        content: "copy target",
        description: "copy target",
        action: (params) => {
          console.log("HIT ", "copy_target", params)
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
        suggestions: (params) => {},
        action: (params) => {
          return sendPlayPause()
            .then(notify.success_control_play)
            .catch(notify.failure_control_play)
        }
      },
      pause: {
        content: "pause",
        description: "Pause current content",
        suggestions: (params) => {},
        action: (params) => {
          return sendPlayPause()
            .then(notify.success_control_pause)
            .catch(notify.failure_control_pause)
        }
      },
      restart: {
        content: "restart",
        description: "Restart current content",
        suggestions: (params) => {},
        action: (params) => {
          return sendRestart()
            .then(notify.success_control_restart)
            .catch(notify.failure_control_restart)
        }
      },
      loop: {
        content: "loop",
        description: "Toggles the current playing media to loop.",
        action: (params) => {
          return sendToggleLoop()
            .then(notify.success_control_loop)
            .catch(notify.failure_control_loop)
        }
      },
      mute: {
        content: "mute",
        description: "mute notifications or current/other tab",
        suggestions: (params) => {
          return params
        },
        action: (params) => {
          // playing | all
        }
      },
    },
    search: {
      content: "search",
      description: "search",
      suggestions: (_params) => {
        console.log("Searching", _params);
        const suggestionsOnEmptyResults = [{
          content: "about:blank",
          description: "no results found"
        }];
        return Promise.resolve(_params)
          .then((params) => {
            return {
              ...params,
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
      action: (params) => {
        console.log("HIT ", "search", params);
        return browser.tabs.create({
          active: true,
          url: params.url
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
      suggestions: (params) => {
        return findInAll(params);
      },
      action: (params) => {
        console.log("HIT", "find", params)
      }
    },
    config: {
      content: "config",
      description: "config",
      action: (params) => {
        console.log("HIT ", "config", params)
        return Promise.resolve(params)
          .then((_params) => _params.split(" ").slice(1))
          .then((args) => {
            // command shortcut, remote uri, color pallete
            if (!args || args.length === 0 || args[0] === 'open') {

            }
            else if (args[0] === "remote") {
              console.log("UPDATING REMOTE TARGET:", args, params);
              //
            }
            return [args, params];
          })
          .then((_params) => {
            return [..._params,
              // stores.config.update((n) => {...n, remote: args[1]})
            ];
          })
          .then(notify.success_config)
          .catch(notify.failure_config)
      },
    },
    tag: {
      content: "tag",
      description: "add this tab's location with a given tag (or none)",
      action: (params) => {
        // return sendLink(params ? params : 'unsorted');
        return getCurrentActiveTab()
          .then((tab) => {
            // let tag = (params && params.length > 0) ? params[1] : 'unsorted'; // TODO make this default the calendar day or something
            // let store = stores[tag];
            // stores[params[1]]
          })
          .catch(print.failure_tag);
      }
    },
    set: {
      content: "set",
      description: "Set tag for this window or tab.",
      action: (params) => {
        console.log("HIT ", "set", params);
        return getCurrentActiveTab()
          .then((tab) => {
            // browser.sessions.removeTabValue(tabId, key)
            browser.sessions.setTabValue(tab.id, params[1]);
          })
          .catch(print.failure);
      },
    },
    panel: {
      content: "panel",
      description: "panel actions by name",
      suggestions: (params) => {
        return Promise.resolve(params)
          .then(() => {
            return Object.keys(panelTypes).map((panelName) => "-".join(panelName.split("-").slice(1)))
          })
          .then(print.success_panel_suggestions)
          .catch(print.failure_panel_suggestions)
      },
      pin: {
        content: "pin",
        description: "pin",
        action: (params) => {
          return getCurrentActiveTab()
            .then((tabs) => browser.tabs.update(tabs, { pinned: true }))
            .catch(print.panel_pin_set_pinned)
        }
      },
      shift: {
        content: "shift",
        description: "shift",
        up: {
          content: "shift up",
          description: "shift up",
          action: (params) => {

          }
        },
        down: {
          content: "shift down",
          description: "shift down",
          action: (params) => {

          }
        },
      },
      close: {
        content: "close",
        description: "panel.close alias to close.panel",
        action: (params) => {

        }
      },
      horizontal: {
        content: "horizontal",
        description: "max/shrink horizontal",
        action: (params) => {

        }
      },
    },
    open: {
      content: "open",
      description: "Opens something [root] (TODO show default action)",
      action: (params) => {
        console.log("HIT ", "open", params)
        // TODO console, options, sidebar, set default in config
        /*
        package: index, current, mark_as_completed, next, reset
        */
      },
      options: {
        content: "options",
        description: "open the plugin options as a tab",
        action: (params) => {
          return browser.runtime.openOptionsPage()
            .catch(print.failure_open_options);
        }
      },
      tab: {
        content: "tab",
        description: "open the plugin tab as a tab",
        action: (params) => {
          return browser.tabs.create({"url": "/index.html"})
            .catch(print.failure_open_options);
        }
      },
      sidebar: {
        content: "sidebar",
        description: "open the plugin sidebar as a tab",
        action: (params) => {
          // TODO sidebar: all, timer, actionmenu
          return browser.sidebarAction.open()
            .catch(print.failure_open_sidebar);
        }
      },
      group: {
        // TODO tie in data stores for autocomplete suggestions
        content: "panel",
        description: "open a group of tabs, tagged with param(s)",
        action: (params) => {
          // return browser.runtime.
        }
      },
      panel: {
        // TODO tie in data stores for autocomplete suggestions
        content: "panel",
        description: "open a panel (and TODO move to top?) in the sidebar for this window",
        action: (params) => {
          // return browser.runtime.
        }
      },
      console: {
        content: "console",
        description: "open the plugin console as a tab",
        action: (params) => {
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
      action: (params) => {
        // Close all sidebars, tagged group, tabs with url / domain / partial match
        // incognito window(s)
        return params;
      },
      sidebar: {
        content: "sidebar",
        description: "Close the sidebar.",
        action: (params) => {
          // TODO sidebar: all, timer, actionmenu
          // FIXME "sidebarAction.close may only be called from a user input handler"
          return browser.sidebarAction.close()
            .catch(print.failure_close_sidebar);
        }
      },
    },
    split: {
      content: "split",
      description: "split",
      action: (params) => {
        console.log("HIT ", "split", params);
        // elos split selected tile column,
        return getHighlightedTabs()
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
            })
          })
          .catch(notify.failure_split)
      },
    },
    track: {
      content: "track",
      description: "track",
      add: {
        content: "track_add",
        description: "track_add",
        action: (params) => { console.log("HIT ", "track_add", params)},
      },
      set_cycle: {
        content: "track_set_cycle",
        description: "track_set_cycle",
        action: (params) => { console.log("HIT ", "track_set_cycle", params)},
      },
      show_as: {
        content: "track_show_as",
        description: "track_show_as",
        action: (params) => { console.log("HIT ", "track_show_as", params)},
      },
    },
    timer: {
      content: "timer",
      description: "timer",
      suggestions: (params) => {
        console.log("HIT ", "timer", params);
        return Promise.resolve(params)
          // .then((_params) => {
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
      action: (params) => {
        console.log("HIT ", "timer", params);
        return Promise.resolve(params)
          .then((_params) => {
            // stores.timers.map((timer) => {})
          })
          .catch(print.failure_timer)
      },
      start: {
        content: "timer_start",
        description: "timer_start",
        action: (params) => { console.log("HIT ", "timer_start", params)},
      },
      pause: {
        content: "timer_pause",
        description: "timer_pause",
        action: (params) => { console.log("HIT ", "timer_pause", params)},
      },
      reset: {
        content: "timer_reset",
        description: "timer_reset",
        action: (params) => { console.log("HIT ", "timer_reset", params)},
      },
      lap: {
        content: "timer_lap",
        description: "timer_lap",
        action: (params) => { console.log("HIT ", "timer_lap", params)},
      },
    },
    help: {
      content: "help",
      description: "help",
      changelog: {
        content: "help_changelog",
        description: "help_changelog",
        action: (params) => { console.log("HIT ", "help_changelog", params)},
      },
      documentation: {
        content: "help_documentation",
        description: "help_documentation",
        action: (params) => { console.log("HIT ", "help_documentation", params)},
      },
      check_for_updates: {
        content: "help_check_for_updates",
        description: "help_check_for_updates",
        action: (params) => { console.log("HIT ", "help_check_for_updates", params)},
      },
      worker_status: {
        content: "help_worker_status",
        description: "help_worker_status",
        action: (params) => { console.log("HIT ", "help_worker_status", params)},
      },
    },
    history: {
      content: "history",
      description: "history",
      last: {
        content: "history_last",
        description: "history_last",
        action: (params) => {
          console.log("HIT ", "history_last_actions", params);

        },
      },
      undo: {
        content: "history_undo",
        description: "history_undo",
        action: (params) => { console.log("HIT ", "history_undo_close", params)},
      },
    },
    convert: {
      content: "convert",
      description: "convert",
      csv_to_json: {
        content: "convert_csv_to_json",
        description: "convert_csv_to_json",
        action: (params) => { console.log("HIT ", "convert_csv_to_json", params)},
      },
      json_to_csv: {
        content: "convert_json_to_csv",
        description: "convert_json_to_csv",
        action: (params) => { console.log("HIT ", "convert_json_to_csv", params)},
      },
    },
    package: {
      content: "package",
      description: "package",
      action: (params) => {
        console.log("HIT ", "package", params);
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
  console.log(err);
  // return Promise.reject(err);
}

export const cmds = _cmds;
console.log('cmds', cmds);

