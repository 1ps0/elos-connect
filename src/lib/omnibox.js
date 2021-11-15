
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
  findInAll,
  _send
} from "./apis.js";

export const cmds = {
  search: {
    content: "search",
    description: "search",
    suggestions: (params) => {
      console.log("Searching", params);
      return Promise.resolve({
        ...params,
        uri: "/api/location/search",
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
      .catch(printFailure);
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
      console.log("HIT SUGGEST:", "find", params)
      return findInAll(params);
    },
    action: (params) => {
      console.log("HIT", "find", params)
    }
  },
  set_config: {
    content: "set_config",
    description: "set_config",
    action: (params) => {
      console.log("HIT ", "set_config", params)
      return Promise.resolve(params)
        .then((_params) => _params.split(" ").slice(1))
        .then((args) => {
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
  set_remote: {
    content: "set_remote",
    description: "Set the remote uri to use by default.",
    action: (params) => {
      return Promise.resolve({
        url: params.args
      });
    }
  },
  set_keymap_sidebar: {
    content: "set_keymap_sidebar",
    description: "set_keymap_sidebar",
    action: (params) => { console.log("HIT ", "set.keymap.sidebar", params)},
  },
  set_keymap_popup: {
    content: "set_keymap_popup",
    description: "set_keymap_popup",
    action: (params) => { console.log("HIT ", "set.keymap.popup", params)},
  },
  set_keymap_options: {
    content: "set_keymap_options",
    description: "set_keymap_options",
    action: (params) => { console.log("HIT ", "set_keymap_options", params)},
  },
  set_keymap_group: {
    content: "set_group",
    description: "set tab group",
    action: (params) => { console.log("HIT ", "set_group", params)},
  },
  open_group: {
    content: "open_group",
    description: "open tab group",
    action: (params) => { console.log("HIT ", "open_group", params)},
  },
  open_package_index: {
    content: "open_package_index",
    description: "open_package_index",
    action: (params) => { console.log("HIT ", "open_package_index", params)},
  },
  open_package_current: {
    content: "open_package_current",
    description: "open_package_current",
    action: (params) => { console.log("HIT ", "open_package_current", params)},
  },
  open_package_mark_as_completed: {
    content: "open_package_mark_as_completed",
    description: "open_package_mark_as_completed",
    action: (params) => { console.log("HIT ", "open_package_mark_as_completed", params)},
  },
  open_package_next: {
    content: "open_package_next",
    description: "open_package_next",
    action: (params) => { console.log("HIT ", "open_package_next", params)},
  },
  open_package_reset: {
    content: "open_package_reset",
    description: "open_package_reset",
    action: (params) => { console.log("HIT ", "open_package_reset", params)},
  },
  open_panel: {
    content: "open_panel",
    description: "open_panel",
    action: (params) => { console.log("HIT ", "open_panel", params)},
  },
  open_sidebar_all: {
    content: "open_sidebar_all",
    description: "open_sidebar_all",
    action: (params) => { console.log("HIT ", "open_sidebar_all", params)},
  },
  open_sidebar_timer: {
    content: "open_sidebar_timer",
    description: "open_sidebar_timer",
    action: (params) => { console.log("HIT ", "open_sidebar_timer", params)},
  },
  open_sidebar_actionmenu: {
    content: "open_sidebar_actionmenu",
    description: "open_sidebar_actionmenu",
    action: (params) => { console.log("HIT ", "open_sidebar_actionmenu", params)},
  },
  open_options: {
    content: "open_options",
    description: "open_options",
    action: (params) => { console.log("HIT ", "open_options", params)},
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
    action: (params) => { console.log("HIT ", "copy_target", params)},
  },
  window_flatten: {
    content: "window_flatten",
    description: "window_flatten",
    action: (params) => {
      console.log("HIT ", "window_flatten", params);

    }
  },
  window_split: {
    content: "window_split",
    description: "window_split",
    action: (params) => {
      console.log("HIT ", "window_split", params)
    },
  },
  window_collect: {
    content: "window_collect",
    description: "window_collect",
    action: (params) => {
      console.log("HIT ", "window_collect", params)
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
  window_stash: {
    content: "window_stash",
    description: "window_stash",
    action: (params) => {
      console.log("HIT ", "window_stash", params);
      // browser.windows.remove(windowId);
      // stash can also discard a tab instead (unload but retain it)
      return getCurrentHighlightedTabs().then( (tabs) => {
        for (const tab of tabs) {

        }
      });
    },
  },
  tab_stash: {
    content: "tab_stash",
    description: "tab_stash",
    action: (params) => {
      console.log("HIT ", "tab_stash", params);
    },
  },
  tab_tag: {
    content: "tab_tag",
    description: "Set a tag for this tab",
    action: (params) => {}
  },
  tab_save_page: {
    content: "tab_save_page",
    description: "tab_save_page",
    action: (params) => {
      console.log("HIT ", "tab_save_page", params);
      // TODO render with readability?
      // TODO save full HTML
    }
  },
  tab_save_video: {
    content: "tab_save_video",
    description: "tab_save_video",
    action: (params) => {
      console.log("HIT tab_save_video, running doDownloadVideo", params);
      return getCurrentActiveTab().then( (tab) => {
        return _send("api/action/download/video", {
          uri: tab[0].url,
        });
      })
      .then(createNotifySuccess)
      .catch(createNotifyFailure);
    },
  },
  tab_save_song: {
    content: "tab_save_song",
    description: "tab_save_song",
    action: (params) => {
      console.log("HIT save_video, running doDownloadVideo", params);
      getCurrentActiveTab.then( (tab) => {
        return _send("api/action/download/audio", {
          uri: tab[0].url,
          args: { tag: 'music' }
        });
      })
      .then(createNotifySuccess)
      .catch(createNotifyFailure);
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
  help_about: {
    content: "help_about",
    description: "help_about",
    action: (params) => { console.log("HIT ", "help_about", params)},
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
  package_add_channel: {
    content: "package_add_channel",
    description: "package_add_channel",
    action: (params) => { console.log("HIT ", "package_add_channel", params)},
  },
  package_update_channel: {
    content: "package_update_channel",
    description: "package_update_channel",
    action: (params) => { console.log("HIT ", "package_update_channel", params)},
  },
  package_list_channel: {
    content: "package_list_channel",
    description: "package_list_channel",
    action: (params) => { console.log("HIT ", "package_list_channel", params)},
  },
  package_remove_channel: {
    content: "package_remove_channel",
    description: "package_remove_channel",
    action: (params) => { console.log("HIT ", "package_remove_channel", params)},
  },
  package_add_index: {
    content: "package_add_index",
    description: "package_add_index",
    action: (params) => { console.log("HIT ", "package_add_index", params)},
  },
  package_update_index: {
    content: "package_update_index",
    description: "package_update_index",
    action: (params) => { console.log("HIT ", "package_update_index", params)},
  },
  package_list_index: {
    content: "package_list_index",
    description: "package_list_index",
    action: (params) => { console.log("HIT ", "package_list_index", params)},
  },
  package_remove_index: {
    content: "package_remove_index",
    description: "package_remove_index",
    action: (params) => { console.log("HIT ", "package_remove_index", params)},
  },
  package_list_installed: {
    content: "package_list_installed",
    description: "package_list_installed",
    action: (params) => { console.log("HIT ", "package_list_installed", params)},
  },
  package_create_package: {
    content: "package_create_package",
    description: "package_create_package",
    action: (params) => { console.log("HIT ", "package_create_package", params)},
  },
  package_install_package: {
    content: "package_install_package",
    description: "package_install_package",
    action: (params) => { console.log("HIT ", "package_install_package", params)},
  },
  package_update_package: {
    content: "package_update_package",
    description: "package_update_package",
    action: (params) => { console.log("HIT ", "package_update_package", params)},
  },
  package_uninstall_package: {
    content: "package_uninstall_package",
    description: "package_uninstall_package",
    action: (params) => { console.log("HIT ", "package_uninstall_package", params)},
  },
  package_set_debug: {
    content: "package_set_debug",
    description: "package_set_debug",
    action: (params) => { console.log("HIT ", "package_set_debug", params)},
  },
  package_discover: {
    content: "package_discover",
    description: "package_discover",
    action: (params) => { console.log("HIT ", "package_discover", params)},
  },
  package_search: {
    content: "package_search",
    description: "package_search",
    action: (params) => { console.log("HIT ", "package_search", params)},
  }
};
