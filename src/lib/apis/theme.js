

import { setContext, getContext } from 'svelte';
import * as proxy from "./proxy.js";


// ------ THEME

//let currentTheme = null;
const _setOmniboxTheme = (params) => {
  // windows.WINDOW_ID_CURRENT
  // return Promise.resolve(params)
  //   .then(browser.theme.update)
  //   .then((_params) => setContext("currentTheme", _params))
  //   .catch(proxy.print.failure_set_omnibox_theme);
};

const setThemeContext = (value) => {
  // return Promise.resolve(value || browser.theme.getCurrent())
  //   .then((_current) => setContext("currentTheme", _current))
  //   .then(proxy.print.success)
  //   .catch(proxy.print.failure);
}

const _resetOmniboxTheme = () => {
  return Promise.resolve("currentTheme")
    .then(getContext)
    .then(proxy.print.status_get_context_current_theme)
    .then(_setOmniboxTheme)
    .catch(proxy.print.failure_reset_omnibox_theme);
}

const resetOmniboxTheme = (params) => {
  return [params, browser.theme.reset()];
}

const createOmniboxActivationTheme = (theme) => {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      toolbar_field: "black",
      toolbar_field_text: "gray",
      toolbar_field_highlight: "green",
      toolbar_field_focus: "black",
      toolbar_field_text_focus: "white",
    }
  };
};

const restoreCurrentTheme = () => {
  return Promise.resolve(
    _currentTheme ?
    _currentTheme : browser.theme.getCurrent()
  )
  .then(createOmniboxActivationTheme)
  .then((params) => {
    _currentTheme = browser.theme.getCurrent();
    return params;
  })
  .then(setOmniboxTheme)
  .catch(proxy.print.failure_restore_current_theme);
}
