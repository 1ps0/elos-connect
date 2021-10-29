
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

// import { stores } from "./lib/stores.js";

import {
  updateCurrentWindow,
  createNotifySuccess,
  createNotifyFailure,
  printSuccess,
  printFailure,
  getCurrentHighlightedTabs,
  getCurrentActiveTab,
  _send
} from "./apis.js";

export const cmds = {
  search: {
    content: "search",
    description: "search",
    suggestions: (params) => {
      console.log("Searching", params);
      _fetch("/api/location/search", params)
        .then((response) => {
          console.log("Got search response", response);
          return response.results.forEach( obj => {
            suggestions.push({
              content: obj.uri,
              description: '['+obj.value+'] '+obj.label,
            });
          });
        })
        .catch(printFailure);
    },
    action: (params) => { console.log("HIT ", "search", params)}
  },
  find: {
    content: "find",
    description: "find in tabs",
    suggestions: (params) => { console.log("HIT SUGGEST:", "find", params); }
  },
  set: {
    content: "set",
    description: "set",
    default: {
      content: "default",
      description: "default",
      open: {
        content: "set.default.open",
        description: "set.default.open",
        action: (params) => { console.log("HIT ", "set.default.open", params)},
      },
    },
    remote: {
      content: "set.remote",
      description: "Set the remote uri to use by default.",
      action: (params) => {

      }
    },
    keymap: {
      content: "keymap",
      description: "keymap",
      sidebar: {
        content: "set.keymap.sidebar",
        description: "set.keymap.sidebar",
        action: (params) => { console.log("HIT ", "set.keymap.sidebar", params)},
      },
      popup: {
        content: "set.keymap.popup",
        description: "set.keymap.popup",
        action: (params) => { console.log("HIT ", "set.keymap.popup", params)},
      },
      options: {
        content: "set.keymap.options",
        description: "set.keymap.options",
        action: (params) => { console.log("HIT ", "set.keymap.options", params)},
      },
    },
    group: {
      content: "set.group",
      description: "set tab group",
      action: (params) => { console.log("HIT ", "set.group", params)},
    }
  },
  open: {
    content: "open",
    description: "open",
    group: {
      content: "open.group",
      description: "open tab group",
      action: (params) => { console.log("HIT ", "open.group", params)},
    },
    package: {
      content: "open.package",
      description: "open.package",
      index: {
        content: "open.package.index",
        description: "open.package.index",
        action: (params) => { console.log("HIT ", "open.package.index", params)},
      },
      current: {
        content: "open.package.current",
        description: "open.package.current",
        action: (params) => { console.log("HIT ", "open.package.current", params)},
      },
      mark_as_completed: {
        content: "open.package.mark_as_completed",
        description: "open.package.mark_as_completed",
        action: (params) => { console.log("HIT ", "open.package.mark_as_completed", params)},
      },
      next: {
        content: "open.package.next",
        description: "open.package.next",
        action: (params) => { console.log("HIT ", "open.package.next", params)},
      },
      reset: {
        content: "open.package.reset",
        description: "open.package.reset",
        action: (params) => { console.log("HIT ", "open.package.reset", params)},
      },
    },
    panel: {
      content: "open.panel",
      description: "open.panel",
      action: (params) => { console.log("HIT ", "open.panel", params)},
    },
    sidebar: {
      content: "sidebar",
      description: "sidebar",
      all: {
        content: "open.sidebar.all",
        description: "open.sidebar.all",
        action: (params) => { console.log("HIT ", "open.sidebar.all", params)},
      },
      timer: {
        content: "open.sidebar.timer",
        description: "open.sidebar.timer",
        action: (params) => { console.log("HIT ", "open.sidebar.timer", params)},
      },
      actionmenu: {
        content: "open.sidebar.actionmenu",
        description: "open.sidebar.actionmenu",
        action: (params) => { console.log("HIT ", "open.sidebar.actionmenu", params)},
      },
    },
    options: {
      content: "open.options",
      description: "open.options",
      action: (params) => { console.log("HIT ", "open.options", params)},
    },
  },
  copy: {
    content: "copy",
    description: "copy",
    tabs: {
      content: "copy.tabs",
      description: "copy.tabs",
      action: (params) => { console.log("HIT ", "copy.tabs", params)},
    },
    target: {
      content: "copy.target",
      description: "copy.target",
      action: (params) => { console.log("HIT ", "copy.target", params)},
    },
  },
  window: {
    content: "window",
    description: "window",
    flatten: {
      content: "window.flatten",
      description: "window.flatten",
      action: (params) => {
        console.log("HIT ", "window.flatten", params);

      },
    },
    split: {
      content: "window.split",
      description: "window.split",
      action: (params) => {
        console.log("HIT ", "window.split", params)
      },
    },
    collect: {
      content: "window.collect",
      description: "window.collect",
      action: (params) => {
        console.log("HIT ", "window.collect", params)
      },
    },
    left: {
      content: "window.left",
      description: "Fit to left side of screen",
      action: (params) => {
        updateCurrentWindow({
          top: 0,
          left: 0,
          width: 768,
          height: 1024
        })
        .then(printSuccess)
        .catch(printFailure);
      },
    },
    right: {
      content: "window.right",
      description: "Fit to right side of screen",
      action: (params) => {
        updateCurrentWindow({
          top: 0,
          left: 768,
          width: 768,
          height: 1024
        })
        .then(printSuccess)
        .catch(printFailure);
      },
    },
    full: {
      content: "window.full",
      description: "Fit to screen",
      action: (params) => {
        updateCurrentWindow({
          top: 0,
          left: 0,
          width: 768 * 2,
          height: 1024
        })
        .then(printSuccess)
        .catch(printFailure);
      },
    },
    stash: {
      content: "window.stash",
      description: "window.stash",
      action: (params) => {
        console.log("HIT ", "window.stash", params);
        // browser.windows.remove(windowId);
        // stash can also discard a tab instead (unload but retain it)
        getCurrentHighlightedTabs().then( (tabs) => {
          for (const tab of tabs) {

          }
        });
      },
    },
  },
  tab: {
    stash: {
      content: "tab.stash",
      description: "tab.stash",
      action: (params) => {
        console.log("HIT ", "tab.stash", params);
      },
    },
    tag: {
      content: "",
      description: "Set a tag for this tab",
      action: (params) => {}
    },
    save: {
      content: "tab.save",
      description: "tab.save",
      page: {
        content: "tab.save.page",
        description: "tab.save.page",
        action: (params) => {
          console.log("HIT ", "tab.save.page", params);
          // TODO render with readability?
          // TODO save full HTML
        }
      },
      video: {
        content: "tab.save.video",
        description: "tab.save.video",
        action: (params) => {
          console.log("HIT tab.save.video, running doDownloadVideo", params);
          getCurrentActiveTab.then( (tab) => {
            return _send("api/action/download/video", {
              uri: tab[0].url,
            });
          })
          .then(createNotifySuccess)
          .catch(createNotifyFailure);
        },
      },
      song: {
        content: "tab.save.song",
        description: "tab.save.song",
        action: (params) => {
          console.log("HIT save.video, running doDownloadVideo", params);
          getCurrentActiveTab.then( (tab) => {
            return _send("api/action/download/audio", {
              uri: tab[0].url,
              args: { tag: 'music' }
            });
          })
          .then(printSuccess)
          .catch(printFailure);
        },
      },
    }
  },
  track: {
    content: "track",
    description: "track",
    add: {
      content: "track.add",
      description: "track.add",
      action: (params) => { console.log("HIT ", "track.add", params)},
    },
    set_cycle: {
      content: "track.set_cycle",
      description: "track.set_cycle",
      action: (params) => { console.log("HIT ", "track.set_cycle", params)},
    },
    show_as: {
      content: "track.show_as",
      description: "track.show_as",
      action: (params) => { console.log("HIT ", "track.show_as", params)},
    },
  },
  timer: {
    content: "timer",
    description: "timer",
    start: {
      content: "timer.start",
      description: "timer.start",
      action: (params) => { console.log("HIT ", "timer.start", params)},
    },
    pause: {
      content: "timer.pause",
      description: "timer.pause",
      action: (params) => { console.log("HIT ", "timer.pause", params)},
    },
    reset: {
      content: "timer.reset",
      description: "timer.reset",
      action: (params) => { console.log("HIT ", "timer.reset", params)},
    },
    lap: {
      content: "timer.lap",
      description: "timer.lap",
      action: (params) => { console.log("HIT ", "timer.lap", params)},
    },
  },
  options: {
    content: "options",
    description: "options",
    action: (params) => { console.log("HIT ", "options", params)},
  },
  help: {
    content: "help",
    description: "help",
    about: {
      content: "help.about",
      description: "help.about",
      action: (params) => { console.log("HIT ", "help.about", params)},
    },
    changelog: {
      content: "help.changelog",
      description: "help.changelog",
      action: (params) => { console.log("HIT ", "help.changelog", params)},
    },
    documentation: {
      content: "help.documentation",
      description: "help.documentation",
      action: (params) => { console.log("HIT ", "help.documentation", params)},
    },
    check_for_updates: {
      content: "help.check_for_updates",
      description: "help.check_for_updates",
      action: (params) => { console.log("HIT ", "help.check_for_updates", params)},
    },
    worker_status: {
      content: "help.worker_status",
      description: "help.worker_status",
      action: (params) => { console.log("HIT ", "help.worker_status", params)},
    },
  },
  history: {
    content: "history",
    description: "history",
    last_actions: {
      content: "history.last_actions",
      description: "history.last_actions",
      action: (params) => { console.log("HIT ", "history.last_actions", params)},
    },
    undo_close: {
      content: "history.undo_close",
      description: "history.undo_close",
      action: (params) => { console.log("HIT ", "history.undo_close", params)},
    },
  },
  convert: {
    content: "convert",
    description: "convert",
    csv_to_json: {
      content: "convert.csv_to_json",
      description: "convert.csv_to_json",
      action: (params) => { console.log("HIT ", "convert.csv_to_json", params)},
    },
    json_to_csv: {
      content: "convert.json_to_csv",
      description: "convert.json_to_csv",
      action: (params) => { console.log("HIT ", "convert.json_to_csv", params)},
    },
  },
  package: {
    content: "package",
    description: "package",
    add_channel: {
      content: "package.add_channel",
      description: "package.add_channel",
      action: (params) => { console.log("HIT ", "package.add_channel", params)},
    },
    update_channel: {
      content: "package.update_channel",
      description: "package.update_channel",
      action: (params) => { console.log("HIT ", "package.update_channel", params)},
    },
    list_channel: {
      content: "package.list_channel",
      description: "package.list_channel",
      action: (params) => { console.log("HIT ", "package.list_channel", params)},
    },
    remove_channel: {
      content: "package.remove_channel",
      description: "package.remove_channel",
      action: (params) => { console.log("HIT ", "package.remove_channel", params)},
    },
    add_index: {
      content: "package.add_index",
      description: "package.add_index",
      action: (params) => { console.log("HIT ", "package.add_index", params)},
    },
    update_index: {
      content: "package.update_index",
      description: "package.update_index",
      action: (params) => { console.log("HIT ", "package.update_index", params)},
    },
    list_index: {
      content: "package.list_index",
      description: "package.list_index",
      action: (params) => { console.log("HIT ", "package.list_index", params)},
    },
    remove_index: {
      content: "package.remove_index",
      description: "package.remove_index",
      action: (params) => { console.log("HIT ", "package.remove_index", params)},
    },
    list_installed: {
      content: "package.list_installed",
      description: "package.list_installed",
      action: (params) => { console.log("HIT ", "package.list_installed", params)},
    },
    create_package: {
      content: "package.create_package",
      description: "package.create_package",
      action: (params) => { console.log("HIT ", "package.create_package", params)},
    },
    install_package: {
      content: "package.install_package",
      description: "package.install_package",
      action: (params) => { console.log("HIT ", "package.install_package", params)},
    },
    update_package: {
      content: "package.update_package",
      description: "package.update_package",
      action: (params) => { console.log("HIT ", "package.update_package", params)},
    },
    uninstall_package: {
      content: "package.uninstall_package",
      description: "package.uninstall_package",
      action: (params) => { console.log("HIT ", "package.uninstall_package", params)},
    },
    set_debug: {
      content: "package.set_debug",
      description: "package.set_debug",
      action: (params) => { console.log("HIT ", "package.set_debug", params)},
    },
    discover: {
      content: "package.discover",
      description: "package.discover",
      action: (params) => { console.log("HIT ", "package.discover", params)},
    },
    search: {
      content: "package.search",
      description: "package.search",
      action: (params) => { console.log("HIT ", "package.search", params)},
    }
  }
};
