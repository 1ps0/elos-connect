

import { setContext, getContext } from 'svelte';
import * as proxy from "./proxy.js";


// ------ THEME

let currentTheme = null;
export const _setOmnibox = (args) => {
  // windows.WINDOW_ID_CURRENT
  return Promise.resolve(args)
    .then(browser.theme.update)
    .then((_args) => setContext("currentTheme", _args))
    .catch(proxy.print.failure_set_omnibox_theme);
};

export const setThemeContext = (value) => {
  return Promise.resolve(value)
    .then(_value => _value || browser.theme.getCurrent())
    .then((_current) => setContext("currentTheme", _current))
    .then(proxy.print.success_set_theme_context)
    .catch(proxy.print.failure_set_theme_context);
}

export const _resetOmnibox = () => {
  return Promise.resolve("currentTheme")
    .then(getContext)
    .then(proxy.print.status_get_context_current_theme)
    .then(_setOmnibox)
    .catch(proxy.print.failure_reset_omnibox_theme);
}

export const resetOmnibox = (args) => {
  return [args, browser.theme.reset()];
}

export const createOmniboxActivation = (theme) => {
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

export const restoreCurrent = () => {
  return Promise.resolve(_currentTheme)
    .then(_theme => _theme || browser.theme.getCurrent()
    // .then(createOmniboxActivation)
    .then((args) => {
      _currentTheme = browser.theme.getCurrent();
      return args;
    }))
    .then(setOmniboxTheme)
    .catch(proxy.print.failure_restore_current_theme);
}
