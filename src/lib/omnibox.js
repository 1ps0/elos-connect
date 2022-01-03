
/*
- 'stash' a window or select group of tabs,
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

import {
  updateCurrentWindow,
  createNotifySuccess,
  createNotifyFailure,
  printSuccess,
  printFailure,
  window_update_size_768,
  getCurrentHighlightedTabs,
  getCurrentActiveTab,
  findInAll,
  sendSidebar,
  doSelectedCopy,
  _send
} from "./apis.js";

let _cmds = {};
try {
  _cmds = {
    select: {
      content: "select",
      description: "select specified tabs",
      action: (params) => {
        console.log("SELECT HIT", params);
        if (params[0] === 'all') {
          browser.tabs.query({currentWindow: true }) // or windowId: windows.WINDOW_ID_CURRENT
            .then(printStatus)
            .then((tabs) => {
              return Promise.all(
                tabs.map((tab) => browser.tabs.update(
                  tab.id, { highlighted: true }
                ))
              )
            })
            .then(printSuccess)
            .catch(printFailure);
        }
      }
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
              url: params && params.url ? params.url : "about:blank",
              ...(params ? params : {})
            })
          })
          .then((_window) => {
            browser.sessions.setWindowValue(
              browser.windows.WINDOW_ID_CURRENT,
              "tag",
              params && params.tag ? params.tag : "elos"
            ).catch(printFailure);
            return _window;
          })
          .then((_window) => {
            // browser. // set container?
            return _window;
          })
          .catch(printFailure);
      }
    },
    gather: {
      content: "gather",
      description: "move input|all tabs to current|new window",
      action: (params) => {
        console.log("HIT", "gather", params);

        // let windows = browser.windows.getAll().then((windows) => {
        //     return windows.filter((_window) => _window.type === "normal")
        //   })

        browser.tabs.query({})
          .then((tabs) => tabs.maps((tab) => tab.id))
          .then(async (tabIds) => {
            let _window = await browser.windows.create().catch(printFailure);
            return browser.tabs.move(tabIds, {
              windowId: _window.id
            })
          })
          .catch(printFailure);
      }
    },
    stash: {
      content: "stash",
      description: "capture essential content in each of the selected tabs, and store with stash",
      action: (params) => {
        console.log("HIT", "stash", params);
        return Promise.resolve(params)
          .catch(printFailure);
      }
    },
    add: {
      content: "add",
      description: "add this tab's location with a given tag (or not)",
      action: (params) => {
        return sendLink(params ? params : 'unsorted');
      }
    },
    save_page: {
      content: "save_page",
      description: "Renders the page with readability and sends content to remote.",
      action: (params) => {
        console.log("HIT ", "save_page", params);
        // TODO render with readability?
        // TODO save full HTML
      }
    },
    save_video: {
      content: "save_video",
      description: "Tells the remote server to download the video in this tab.",
      action: (params) => {
        console.log("HIT save_video, running doDownloadVideo", params);
        return getCurrentActiveTab().then( (tab) => {
          return _send("api/action/download/video", {
            uri: tab[0].url,
            save: true,
            tag: "unsorted"
          });
        })
        .then(createNotifySuccess)
        .catch(createNotifyFailure);
      },
    },
    save_song: {
      content: "save_song",
      description: "Tells the remote server to download the music in this tab.",
      action: (params) => {
        console.log("HIT save_audio, running doDownloadAudio", params);
        getCurrentActiveTab.then( (tab) => {
          return _send("api/action/download/audio", {
            uri: tab[0].url,
            args: { tag: 'audio' }
          });
        })
        .then(createNotifySuccess)
        .catch(createNotifyFailure);
      },
    },
    copy_tabs: {
      content: "copy_tabs",
      description: "copy_tabs",
      action: (params) => {
        console.log("HIT ", "copy_tabs", params)
        return Promise.resolve()
          .then(doSelectedCopy)
          .then(createNotifySuccess, createNotifyFailure)
          .catch(printFailure)
      },
    },
    copy_target: {
      content: "copy_target",
      description: "copy_target",
      action: (params) => {
        console.log("HIT ", "copy_target", params)
        // selected target ON PAGE
      },
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
    reload: {
      content: "reload",
      description: "reload plugin",
      action: (params) => {
        console.log("HIT", "reload", params);
        return browser.runtime.reload().
          catch(createNotifyFailure);
      }
    },
    search: {
      content: "search",
      description: "search",
      suggestions: (params) => {
        console.log("Searching", params);
        const suggestionsOnEmptyResults = [{
          content: "about:blank",
          description: "no results found"
        }];
        return Promise.resolve(suggestionsOnEmptyResults)
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
              description: '['+obj.value+'] '+obj.label,
            };
          });
        })
        .catch(printFailure)
        .then(_ => suggestionsOnEmptyResults);
      },
      action: (params) => { console.log("HIT ", "search", params)}
    },
    find: {
      content: "find",
      description: "find in tabs",
      // option: open find results in new "tab" or panel
      // option: show suggestions with tabs containing criteria
      //  - suggestions have tab name and matched criteria/surrounding
      suggestions: (params) => {
        console.log("HIT SUGGEST:", "find", params);
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
            if (args[0] === "remote") {
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
        return sendLink(params ? params : 'unsorted');
      }
    },
    set: {
      content: "set",
      description: "Set tag for this window or tab.",
      action: (params) => {
        console.log("HIT ", "set", params);
        return Promise.resolve(params)
          .then((values) => {
            // browser.sessions.removeTabValue(tabId, key)
            values.forEach((pair) => {
              browser.sessions.setTabValue(pair[0], pair[1]);
            });
          })
          .catch(printFailure);
      },
    },
    open: {
      content: "open",
      description: "Opens a panel or tagged group of links",
      action: (params) => {
        console.log("HIT ", "open", params)
        return;
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
      description: `close:`,
      action: (params) => {
        // Close all sidebars
        // tagged group
        // incognito window(s)
        // tabs with url / domain / partial match
        return params;
      }
    },
    window_split: {
      content: "window_split",
      description: "window_split",
      action: (params) => {
        console.log("HIT ", "window_split", params)
      },
    },
    window_left: {
      content: "window_left",
      description: "Fit to left side of screen",
      action: (params) => {
        return updateCurrentWindow({
          top: 0,
          left: 0,
          width: 768,
          height: 1024
        })
        .then(createNotifySuccess)
        .catch(createNotifyFailure);
      },
    },
    window_right: {
      content: "window_right",
      description: "Fit to right side of screen",
      action: (params) => {
        return updateCurrentWindow({
          top: 0,
          left: 768,
          width: 768,
          height: 1024
        })
        .then(createNotifySuccess)
        .catch(createNotifyFailure);
      },
    },
    window_full: {
      content: "window_full",
      description: "Fit to screen",
      action: (params) => {
        return updateCurrentWindow({
          top: 0,
          left: 0,
          width: 768 * 2,
          height: 1024
        })
        .then(createNotifySuccess)
        .catch(createNotifyFailure);
      },
    },
    popout: {
      content: "popout",
      description: "popout",
      action: (params) => {
        console.log("HIT ", "popout", params);
      },
    },
    track_add: {
      content: "track_add",
      description: "track_add",
      action: (params) => { console.log("HIT ", "track_add", params)},
    },
    track_set_cycle: {
      content: "track_set_cycle",
      description: "track_set_cycle",
      action: (params) => { console.log("HIT ", "track_set_cycle", params)},
    },
    track_show_as: {
      content: "track_show_as",
      description: "track_show_as",
      action: (params) => { console.log("HIT ", "track_show_as", params)},
    },
    timer_start: {
      content: "timer_start",
      description: "timer_start",
      action: (params) => { console.log("HIT ", "timer_start", params)},
    },
    timer_pause: {
      content: "timer_pause",
      description: "timer_pause",
      action: (params) => { console.log("HIT ", "timer_pause", params)},
    },
    timer_reset: {
      content: "timer_reset",
      description: "timer_reset",
      action: (params) => { console.log("HIT ", "timer_reset", params)},
    },
    timer_lap: {
      content: "timer_lap",
      description: "timer_lap",
      action: (params) => { console.log("HIT ", "timer_lap", params)},
    },
    options: {
      content: "options",
      description: "options",
      action: (params) => { console.log("HIT ", "options", params)},
    },
    help: {
      content: "help",
      description: "help",
      action: (params) => { console.log("HIT ", "help", params)},
    },
    help_changelog: {
      content: "help_changelog",
      description: "help_changelog",
      action: (params) => { console.log("HIT ", "help_changelog", params)},
    },
    help_documentation: {
      content: "help_documentation",
      description: "help_documentation",
      action: (params) => { console.log("HIT ", "help_documentation", params)},
    },
    help_check_for_updates: {
      content: "help_check_for_updates",
      description: "help_check_for_updates",
      action: (params) => { console.log("HIT ", "help_check_for_updates", params)},
    },
    help_worker_status: {
      content: "help_worker_status",
      description: "help_worker_status",
      action: (params) => { console.log("HIT ", "help_worker_status", params)},
    },
    history_last_actions: {
      content: "history_last_actions",
      description: "history_last_actions",
      action: (params) => { console.log("HIT ", "history_last_actions", params)},
    },
    history_undo_close: {
      content: "history_undo_close",
      description: "history_undo_close",
      action: (params) => { console.log("HIT ", "history_undo_close", params)},
    },
    convert_csv_to_json: {
      content: "convert_csv_to_json",
      description: "convert_csv_to_json",
      action: (params) => { console.log("HIT ", "convert_csv_to_json", params)},
    },
    convert_json_to_csv: {
      content: "convert_json_to_csv",
      description: "convert_json_to_csv",
      action: (params) => { console.log("HIT ", "convert_json_to_csv", params)},
    },
    package: {
      content: "package",
      description: "package",
      suggestions: () => [
        {
          content: "add_channel",
          description: "add_channel"
        },
        {
          content: "add_index",
          description: "add_index"
        },
        {
          content: "create_package",
          description: "create_package"
        },
        {
          content: "discover",
          description: "discover"
        },
        {
          content: "install_package",
          description: "install_package"
        },
        {
          content: "list_channel",
          description: "list_channel"
        },
        {
          content: "list_index",
          description: "list_index"
        },
        {
          content: "list_installed",
          description: "list_installed"
        },
        {
          content: "remove_channel",
          description: "remove_channel"
        },
        {
          content: "remove_index",
          description: "remove_index"
        },
        {
          content: "search",
          description: "search"
        },
        {
          content: "set_debug",
          description: "set_debug"
        },
        {
          content: "uninstall_package",
          description: "uninstall_package"
        },
        {
          content: "update_channel",
          description: "update_channel"
        },
        {
          content: "update_index",
          description: "update_index"
        },
        {
          content: "update_package",
          description: "update_package"
        }
      ],
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

