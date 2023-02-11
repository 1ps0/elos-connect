
import { print, notify, register } from "./proxy.js";

// ------- WINDOW FUNCTIONS

export const createWindow = (args) => {
  return Promise.resolve(args ? args : {
    // type: "popup",
    type: "detached_panel",
    incognito: true,
  })
  .then(browser.windows.create)
  .catch(print.failure_window_create);
}

export const setTitle = (data) => {
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

export const addActiveWindowId = (data) => {
  return browser.windows.getCurrent()
    .then((_window) => ({
      ...data,
      windowId: _window.id
    }))
    .catch(print.failure_add_active_window_id)
}


// TODO allow update but not focus when clicked w/shift or something
export const setActive = (data) => {
  return Promise.resolve(data)
    .then(print.start_set_window_active)
    .then(enrichItem)
    .then((_data) => {
      return browser.windows.update(
        _data.windowId,
        { focused: true }
      );
    })
    .catch(print.failure_set_window_active);
}

export const getAll = (params) => {
  return Promise.resolve(params)
    .then(browser.windows.getAll)
    .then((_windows) => {
      return _windows.filter((_window) => _window.id != _windows.WINDOW_ID_NONE);
    })
    .catch(print.failure_get_all_windows)
}

export const getCurrent = (params) => {
  return Promise.resolve(params)
    .then(browser.windows.getCurrent)
    .catch(print.failure_get_current_window);
}

export const getByPrefix = (prefix) => {
  return getAllWindows()
    .then((_windows) => {
      return _windows.filter((_window) => {
        _window.title.indexOf(prefix) != -1
      })
    })
    .catch(print.failure_get_window_by_prefix)
}

export const update = (params) => {
  return Promise.resolve(params)
    .then((_params) => browser.windows.update(..._params))
    .catch(print.failure_update_window);
}

export const updateCurrent = (params) => {
  return browser.windows.update(
    browser.windows.WINDOW_ID_CURRENT,
    params
  ).catch(print.failure_update_current_window);
};


export const getTabsByWindowValue = (value) => {
    return new Promise((resolve, reject) => {
        browser.windows.getAll().then((windows) => {
            const targetWindow = windows.find((window) => {
                return window.value === value;
            });
            if (!targetWindow) {
                reject(`Window with value "${value}" not found`);
            }
            browser.tabs.query({ windowId: targetWindow.id }).then((tabs) => {
                resolve(tabs);
            });
        });
    });
}

