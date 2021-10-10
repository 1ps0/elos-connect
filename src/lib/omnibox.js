
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

export const cmds = {
  search: {
    content: "search",
    description: "search",
    url: {
      content: "search.url",
      description: "search.url",
      action: () => { console.log("HIT ", "search.url")},
    },
    tag: {
      content: "search.tag",
      description: "search.tag",
      action: () => { console.log("HIT ", "search.tag")},
    },
    title: {
      content: "search.title",
      description: "search.title",
      action: () => { console.log("HIT ", "search.title")},
    },
    query: {
      content: "search.query",
      description: "search.query",
      action: () => { console.log("HIT ", "search.query")}, // freeform, for triplet, vector, or other arbitrary search google style
  },
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
        action: () => { console.log("HIT ", "set.default.open")},
      },
    },
    keymap: {
      content: "keymap",
      description: "keymap",
      sidebar: {
        content: "set.keymap.sidebar",
        description: "set.keymap.sidebar",
        action: () => { console.log("HIT ", "set.keymap.sidebar")},
      },
      popup: {
        content: "set.keymap.popup",
        description: "set.keymap.popup",
        action: () => { console.log("HIT ", "set.keymap.popup")},
      },
      options: {
        content: "set.keymap.options",
        description: "set.keymap.options",
        action: () => { console.log("HIT ", "set.keymap.options")},
      },
    }
  },
  open: {
    content: "open",
    description: "open",
    package: {
      content: "open.package",
      description: "open.package",
      index: {
        content: "open.package.index",
        description: "open.package.index",
        action: () => { console.log("HIT ", "open.package.index")},
      },
      current: {
        content: "open.package.current",
        description: "open.package.current",
        action: () => { console.log("HIT ", "open.package.current")},
      },
      mark_as_completed: {
        content: "open.package.mark_as_completed",
        description: "open.package.mark_as_completed",
        action: () => { console.log("HIT ", "open.package.mark_as_completed")},
      },
      next: {
        content: "open.package.next",
        description: "open.package.next",
        action: () => { console.log("HIT ", "open.package.next")},
      },
      reset: {
        content: "open.package.reset",
        description: "open.package.reset",
        action: () => { console.log("HIT ", "open.package.reset")},
      },
    },
    panel: {
      content: "open.panel",
      description: "open.panel",
      action: () => { console.log("HIT ", "open.panel")},
    },
    sidebar: {
      content: "sidebar",
      description: "sidebar",
      all: {
        content: "open.sidebar.all",
        description: "open.sidebar.all",
        action: () => { console.log("HIT ", "open.sidebar.all")},
      },
      timer: {
        content: "open.sidebar.timer",
        description: "open.sidebar.timer",
        action: () => { console.log("HIT ", "open.sidebar.timer")},
      },
      actionmenu: {
        content: "open.sidebar.actionmenu",
        description: "open.sidebar.actionmenu",
        action: () => { console.log("HIT ", "open.sidebar.actionmenu")},
      },
    },
    options: {
      content: "open.options",
      description: "open.options",
      action: () => { console.log("HIT ", "open.options")},
    },
  },
  copy: {
    content: "copy",
    description: "copy",
    tabs: {
      content: "copy.tabs",
      description: "copy.tabs",
      action: () => { console.log("HIT ", "copy.tabs")},
    },
    target: {
      content: "copy.target",
      description: "copy.target",
      action: () => { console.log("HIT ", "copy.target")},
    },
  },
  save: {
    content: "save",
    description: "save",
    page: {
      tag: {
        content: "save.page.tag",
        description: "save.page.tag",
        action: () => { console.log("HIT ", "save.page.tag")},
      }
    },
    video: {
      content: "save.video",
      description: "save.video",
      action: () => { console.log("HIT ", "save.video")},
    },
    song: {
      content: "save.song",
      description: "save.song",
      action: () => { console.log("HIT ", "save.song")},
    },
  },
  window: {
    content: "window",
    description: "window",
    flatten: {
      content: "window.flatten",
      description: "window.flatten",
      action: () => { console.log("HIT ", "window.flatten")},
    },
    split_by_tag: {
      content: "window.split_by_tag",
      description: "window.split_by_tag",
      action: () => { console.log("HIT ", "window.split_by_tag")},
    },
    collect_by_tag: {
      content: "window.collect_by_tag",
      description: "window.collect_by_tag",
      action: () => { console.log("HIT ", "window.collect_by_tag")},
    },
    left: {
      content: "window.left",
      description: "Fit to left side of screen",
      action: () => {
        browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
          top: 0,
          left: 0,
          width: 768,
          height: 1024
        });
        console.log("HIT ", "window.left")
      },
    },
    right: {
      content: "window.right",
      description: "Fit to right side of screen",
      action: () => {
        browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
          top: 0,
          left: 768,
          width: 768,
          height: 1024
        });
        console.log("HIT ", "window.right")
      },
    },
    full: {
      content: "window.full",
      description: "Fit to screen",
      action: () => {
        browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
          top: 0,
          left: 0,
          width: 768 * 2,
          height: 1024
        });
        console.log("HIT ", "window.full")
      },
    }
  },
  track: {
    content: "track",
    description: "track",
    add: {
      content: "track.add",
      description: "track.add",
      action: () => { console.log("HIT ", "track.add")},
    },
    set_cycle: {
      content: "track.set_cycle",
      description: "track.set_cycle",
      action: () => { console.log("HIT ", "track.set_cycle")},
    },
    show_as: {
      content: "track.show_as",
      description: "track.show_as",
      action: () => { console.log("HIT ", "track.show_as")},
    },
  },
  timer: {
    content: "timer",
    description: "timer",
    start: {
      content: "timer.start",
      description: "timer.start",
      action: () => { console.log("HIT ", "timer.start")},
    },
    pause: {
      content: "timer.pause",
      description: "timer.pause",
      action: () => { console.log("HIT ", "timer.pause")},
    },
    reset: {
      content: "timer.reset",
      description: "timer.reset",
      action: () => { console.log("HIT ", "timer.reset")},
    },
    lap: {
      content: "timer.lap",
      description: "timer.lap",
      action: () => { console.log("HIT ", "timer.lap")},
    },
  },
  options: {
    content: "options",
    description: "options",
    action: () => { console.log("HIT ", "options")},
  },
  help: {
    content: "help",
    description: "help",
    about: {
      content: "help.about",
      description: "help.about",
      action: () => { console.log("HIT ", "help.about")},
    },
    changelog: {
      content: "help.changelog",
      description: "help.changelog",
      action: () => { console.log("HIT ", "help.changelog")},
    },
    documentation: {
      content: "help.documentation",
      description: "help.documentation",
      action: () => { console.log("HIT ", "help.documentation")},
    },
    check_for_updates: {
      content: "help.check_for_updates",
      description: "help.check_for_updates",
      action: () => { console.log("HIT ", "help.check_for_updates")},
    },
    worker_status: {
      content: "help.worker_status",
      description: "help.worker_status",
      action: () => { console.log("HIT ", "help.worker_status")},
    },
  },
  history: {
    content: "history",
    description: "history",
    last_actions: {
      content: "history.last_actions",
      description: "history.last_actions",
      action: () => { console.log("HIT ", "history.last_actions")},
    },
    undo_close: {
      content: "history.undo_close",
      description: "history.undo_close",
      action: () => { console.log("HIT ", "history.undo_close")},
    },
  },
  convert: {
    content: "convert",
    description: "convert",
    csv_to_json: {
      content: "convert.csv_to_json",
      description: "convert.csv_to_json",
      action: () => { console.log("HIT ", "convert.csv_to_json")},
    },
    json_to_csv: {
      content: "convert.json_to_csv",
      description: "convert.json_to_csv",
      action: () => { console.log("HIT ", "convert.json_to_csv")},
    },
  },
  package: {
    content: "package",
    description: "package",
    add_channel: {
      content: "package.add_channel",
      description: "package.add_channel",
      action: () => { console.log("HIT ", "package.add_channel")},
    },
    update_channel: {
      content: "package.update_channel",
      description: "package.update_channel",
      action: () => { console.log("HIT ", "package.update_channel")},
    },
    list_channel: {
      content: "package.list_channel",
      description: "package.list_channel",
      action: () => { console.log("HIT ", "package.list_channel")},
    },
    remove_channel: {
      content: "package.remove_channel",
      description: "package.remove_channel",
      action: () => { console.log("HIT ", "package.remove_channel")},
    },
    add_index: {
      content: "package.add_index",
      description: "package.add_index",
      action: () => { console.log("HIT ", "package.add_index")},
    },
    update_index: {
      content: "package.update_index",
      description: "package.update_index",
      action: () => { console.log("HIT ", "package.update_index")},
    },
    list_index: {
      content: "package.list_index",
      description: "package.list_index",
      action: () => { console.log("HIT ", "package.list_index")},
    },
    remove_index: {
      content: "package.remove_index",
      description: "package.remove_index",
      action: () => { console.log("HIT ", "package.remove_index")},
    },
    list_installed: {
      content: "package.list_installed",
      description: "package.list_installed",
      action: () => { console.log("HIT ", "package.list_installed")},
    },
    create_package: {
      content: "package.create_package",
      description: "package.create_package",
      action: () => { console.log("HIT ", "package.create_package")},
    },
    install_package: {
      content: "package.install_package",
      description: "package.install_package",
      action: () => { console.log("HIT ", "package.install_package")},
    },
    update_package: {
      content: "package.update_package",
      description: "package.update_package",
      action: () => { console.log("HIT ", "package.update_package")},
    },
    uninstall_package: {
      content: "package.uninstall_package",
      description: "package.uninstall_package",
      action: () => { console.log("HIT ", "package.uninstall_package")},
    },
    set_debug: {
      content: "package.set_debug",
      description: "package.set_debug",
      action: () => { console.log("HIT ", "package.set_debug")},
    },
    discover: {
      content: "package.discover",
      description: "package.discover",
      action: () => { console.log("HIT ", "package.discover")},
    },
    search: {
      content: "package.search",
      description: "package.search",
      action: () => { console.log("HIT ", "package.search")},
    }
  }
};
// commandOptionsWritable.subscribe(val => { console.log("HIT ", "history", val.history())) "history", val.history())
