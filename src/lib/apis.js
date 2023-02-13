// 2nd order

import { get } from 'svelte/store';

// TODO trim
import { stores } from "./stores.js";
import * as network from "./network.js";
import * as send from "./send.js";

// -- apis/*.js joined here
import * as bookmarks from "./apis/bookmarks.js";
import * as files from "./apis/files.js";
import * as proxy from "./apis/proxy.js";
import * as reduce from "./apis/reduce.js";
import * as tabs from "./apis/tabs.js";
import * as windows from "./apis/windows.js";



export const getBrowserInfo = async () => {
  return browser.runtime.getBrowserInfo()
  .then((_b) => {
    return {
      name: _b.name,
      version: _b.version
    }
  })
  .catch(proxy.print.failure_get_browser_info);
};

