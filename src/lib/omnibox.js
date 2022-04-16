
/*
- (DONE) 'stash' a window or select group of tabs,
    label the group in a panel,
    reopen one or all

- elos stash all
- elos stash <selected> (implied)
- elos stash window

- elos load window config-1 // fullscreen or minimize, resize if possible, domains to fullscreen

- 'pin' panel across windows
- enable remote server

- add top/bottom bar for panels

- elos popout <selected> // extract selected tags to new window
- elos tagas tagName <selected>
- elos select all
- elos stashas tagName

- elos ??? // move a panel from sidebar to page

// input actions determine later function shapes

- macros defined by in-plugin editors
- macros have comment showing a dump of `vars()` equivalent, and other available functions

// define: macro is use of a deifned external api to structure and execute high level actions

- last suggestions loaded on bar select
- set elos as default?

- rulegen: put tag of tagName in folder /Volumes/FATBOY/pictures/tagName

- window_manager: count of windows, count of tabs, hungriest tabs, force browser GC?
*/

/* findNeighborCommands
  GOAL: find a pool of suggestion-format objects from a given lastInput | cmds
  set keywords as:
    unique union cmd in cmds as:
      cmd.split('_')
  set parts = lastInput.split(' ')
  set keys = unique union parts and keywords
  set args = parts - keys
  set values = cmds[keys]
  set results = values(args)
  set result = results {
    suggestionCount: int,
    priority: int,
    type: operation | network,
    content: [result]
  }
  show ephemeral panel in sidebar with the results from hovered menu item
*/

// import { stores } from "./lib/stores.js";
console.log("LOAD///omnibox");
import {
  doSelectedCopy,
  doReloadSystem,
  reduceTabs,
  findInAll,
  filterTabs,
  moveTab,
  getAllTabs,
  getCurrentActiveTab,
  getHighlightedTabs,
  setWindowTitle,
  tabQueries,
  syncStorage,
  sendRestart,
  sendToggleLoop,
  sendPlayPause,
  updateCurrentWindow,
  updateClipboard,
  _fetch,
  _send,
  createNotifyFailure,
  createNotifySuccess,
  print,
} from "./apis.js";
import { stores } from "./stores.js";

let _cmds = {};
try {
  _cmds = {
    sync: {
      content: "sync",
      description: "sync current state with remote.",
      // suggestions: (params) => {
      //   mine: {
      //     content: "mine",
      //     description: "send mine and prefer it for value conflicts"
      //   }
      // }),
      action: (params) => {
        console.log("HIT sync", params);
        return Promise.resolve((params && params.length) ? params : undefined)
          .then(syncStorage)
          .then(createNotifySuccess)
          .catch(print.failure_sync);
      },
    },
    window: {
      content: "window",
      description: "window",
      action: (_params) => {
        console.log("HIT", "window", _params);
        return Promise.resolve(_params)
          .then((params) => {
            // TODO get selected identity or default container (like for elos)
            return params;
          })
          .then((params) => {
            return browser.windows.create({
              url: params && params[0] ? params[0] : "about:blank",
              ...(params ? params : {})
            })
          })
          .then((_window) => {
            // browser. // set container?
            return _window;
          })
          .catch(print.failure);
      },
      left: {
        content: "window_left",
        description: "Fit to left side of screen",
        action: (params) => {
          return updateCurrentWindow({
            top: 0,
            left: 0,
            width: window.screen.availWidth / 2,
            height: window.screen.availHeight,
          })
          .then(createNotifySuccess)
          .catch(createNotifyFailure);
        },
      },
      right: {
        content: "window_right",
        description: "Fit to right side of screen",
        action: (params) => {
          return updateCurrentWindow({
            top: 0,
            left: window.screen.availWidth / 2,
            width: window.screen.availWidth / 2,
            height: window.screen.availHeight,
          })
          .then(createNotifySuccess)
          .catch(createNotifyFailure);
        },
      },
      full: {
        content: "window_full",
        description: "Fit to screen",
        action: (params) => {
          return updateCurrentWindow({
            top: 0,
            left: 0,
            width: window.screen.availWidth,
            height: window.screen.availHeight,
          })
          .then(createNotifySuccess)
          .catch(createNotifyFailure);
        },
      },
    },
    gather: {
      content: "gather",
      description: "move input|all tabs to current|new window",
      action: (params) => {
        console.log("HIT", "gather", params);
        // params in ('all', '<domain>', <tag>, ilike <title>, type: video, audio, article)
        let tabs = Promise.resolve(params)
          .then(filterTabs)
          .then((tabs) => tabs.map((tab) => tab.id))
          // .then((tabIds) =>{})
          .catch(print.failure_get_filtered_tabs)

        return Promise.resolve({
          top: 0,
          left: 0,
          width: window.screen.availWidth,
          height: window.screen.availHeight,
        })
        .then(browser.windows.create)
        .then((_window) => {
          return Promise.all(tabs.map((tab) => {
            return moveTab(tab, _window)
          }))
          .catch(print.failure_move_tabs)
        })
        .catch(print.failure_gather)
      }
    },
    select: {
      content: "select",
      description: "select specified tabs",
      action: (params) => {
        console.log("SELECT HIT", params);
        if (params[0] === 'all') {
          browser.tabs.query({currentWindow: true }) // or windowId: windows.WINDOW_ID_CURRENT
            .then(print.status_select_tabs)
            .then((tabs) => {
              return Promise.all(
                tabs.map((tab) => browser.tabs.update(
                  tab.id, { highlighted: true }
                ))
              )
            })
            .then(createNotifySuccess)
            .catch(print.failure_select);
        }
      }
    },
    popout: {
      content: "popout",
      description: "popout current tab (default to left half",
      action: (params) => {
        let _window = Promise.resolve({
          top: 0,
          left: 0,
          width: window.screen.availWidth,
          height: window.screen.availHeight,
        })
        .then(browser.windows.create)
        .catch(print.failure_popout_create_window);

        return getCurrentActiveTab()
          .then(async (tab) => moveTab(tab[0], (await _window)))
          .catch(print.failure_popout_move_tab)
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
            return tabs.map((tab) => ({
              content: tab.url,
              description: tab.title
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
    title: {
      content: "title",
      description: "set the title of the window/tab",
      action: (params) => {
        console.log("HIT", "title", params);
        if (params.length) {
          return Promise.resolve(params)
            .then(setWindowTitle)
            .then(createNotifySuccess)
            .catch(print.failure_set_window_title);
        }
      }
    },
    sidebar: {
      content: "sidebar",
      description: "PARAMS: open, close, ...?; Manage the sidebar state.",
      suggestions: (params) => {},
      action: (params) => {
        console.log("HIT", "sidebar", params);
        let arg = params && params.length ? params[0] : 'open';
        switch(arg) {
          case 'open':
          case 'close':
          default:
            console.log("[CMD][sidebar]", arg);
        }
      }
    },
    stash: {
      content: "stash",
      description: "PARAMS: this, window, all | [tag_name]; Capture essential content in each of the selected tabs, and store with stash.",
      suggestions: (params) => {
        console.log("SUGGESTIONS", params);
        return browser.storage.local.get("stash")
          .then((result) => result.stash)
          .then((_stash) => {
            return ((_stash && _stash[params[1]]) ? _stash[params[1]] : [])
              .map((item) => {
                return {
                  content: item.uri,
                  description: item.label,
                  tag: params[0],
                  ...item,
                }
              })
          })
          .catch(print.failure_stash_suggestions)
          // .then(() => [{
          //   content: "No stash found.",
          //   description: "No stash found.",
          // }]);
      },
      action: (params) => {
        console.log("HIT", "stash", params);
        // params: null, "this", "window", "all"
        let _tag = params.length > 1 ? params.slice(1) : 'unsorted';
        let _tabs = Promise.resolve(params)
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

        return browser.storage.local.get("stash")
          .then((result) => result.stash)
          .then((_stash) => _stash ? _stash : {})
          .then(async (_stash) => {
            if (!(_tag in _stash)) {
              _stash[_tag] = [];
            }
            (await _tabs).forEach((item) => {
              if (!item.tag || item.tag === "unsorted") {
                item.tag = _tag;
              }
              _stash[_tag].push(item);
              console.log("PUSHING", _tag, item, _stash);
            });
            return _stash;
          })
          .then(browser.storage.local.set)
          .then(() => {
            return Promise.resolve(_tabs)
              .then((_tabData) => _tabData.map((_tab) => _tab.tabId))
              .then(browser.tabs.remove)
              .catch(print.failure_stash_tabs_remove)
          })
          .then(createNotifySuccess)
          .catch(print.failure_stash)
      },
      clear: {
        content: "clear",
        description: "clear",
        action: (params) => {
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
      }
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
            .then(createNotifySuccess)
            .catch(createNotifyFailure)
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
            .then(createNotifySuccess)
            .catch(createNotifyFailure);
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
            .then(createNotifySuccess, createNotifyFailure)
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
    // what constitutes an 'action', and a 'subcommand'
    control: {
      content: "control current context",
      description: "",
      play: {
        content: "play",
        description: "Play current content",
        suggestions: (params) => {},
        action: (params) => {
          return sendPlayPause()
            .then(createNotifySuccess)
            .catch(createNotifyFailure)
      },
      pause: {
        content: "pause",
        description: "Pause current content",
        suggestions: (params) => {},
        action: (params) => {
          return sendPlayPause()
            .then(createNotifySuccess)
            .catch(createNotifyFailure)
      },
      restart: {
        content: "restart",
        description: "Restart current content",
        suggestions: (params) => {},
        action: (params) => {
          return sendRestart()
            .then(createNotifySuccess)
            .catch(createNotifyFailure)
      },
      loop: {
        content: "loop",
        description: "Toggles the current playing media to loop.",
        action: (params) => {
          return sendToggleLoop()
            .then(createNotifySuccess)
            .catch(createNotifyFailure)
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
    reload: {
      content: "reload",
      description: "reload plugin",
      action: (params) => doReloadSystem()
        .then(createNotifySuccess)
        .catch(createNotifyFailure)
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
          // .then(print.fetch_response)
          .catch(print.failure_search)
          // .then(err => suggestionsOnEmptyResults);
      },
      action: (params) => {
        console.log("HIT ", "search", params);
        browser.tabs.create({
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
          .then(createNotifySuccess)
          .catch(createNotifyFailure)
      },
    },
    tag: {
      content: "tag",
      description: "add this tab's location with a given tag (or none)",
      action: (params) => {
        // return sendLink(params ? params : 'unsorted');
        return getCurrentActiveTab()
          .then((tab) => {
            let tag = (params && params.length > 0) ? params[1] : 'unsorted'; // TODO make this default the calendar day or something
            let store = stores[tag];
            stores[params[1]]
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
    open: {
      content: "open",
      description: "Opens a panel or tagged group of links",
      action: (params) => {
        console.log("HIT ", "open", params)
        if (!params && params.length == 0) { return; }
        if (params[0] === 'options') {
          return browser.runtime.openOptionsPage()
            .catch(print.failure_open_options);
        } else if (params[0] === 'sidebar') {
          return browser.sidebarAction.open()
            .catch(print.failure_open_sidebar);
        } else {
          return browser.windows.create({ url: params.url });
        }
        /*
        group:
        package: index, current, mark_as_completed, next, reset
        sidebar: all, timer, actionmenu
        panel: // TODO tie in data stores for autocomplete suggestions
        options:
        */
      },
    },
    close: {
      content: "close",
      description: `Close all sidebars, tagged group, tabs with url / domain / partial match`,
      action: (params) => {
        // Close all sidebars, tagged group, tabs with url / domain / partial match
        // incognito window(s)
        return params;
      }
    },
    split: {
      content: "split",
      description: "split",
      action: (params) => {
        console.log("HIT ", "split", params);
        // elos split selected tile column,
        return getHighlightedTabs()
          .then((tabs) => {
            const screen_width = window.screen.availWidth;
            const count = max(3, tabs.length + 1);
            const _width = Math.floor(screen_width / count);
            const _height = window.screen.availHeight;
            tabs.forEach((tab, idx) => {
              browser.windows.create({
                  tabId: tab.id,
                  height: _height,
                  width: _width,
                  left: _width * idx,
                  top: 0
                })
                .catch(print.failure_split_tabs);
            })
          })
          .catch(createNotifyFailure)
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
          .then((_params) => {
            return Promise.all(stores.timers.map((timer) => {
              let _timer = get(timer);
              return {
                content: `${_timer.name}`,
                description: `${_timer.name} (${_timer.currentTime()})`,
              }
            }))
          })
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
      clear: {
        content: "history_clear",
        description: "clear history given params: tab, window, session, by domain, by timestamp",
        action: (params) => { console.log("HIT ", "history_clear", params)},
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

