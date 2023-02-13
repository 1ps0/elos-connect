// 2nd order, +complexity dependent @../config/parameters

/*
need a 'view' window of current open stuff to maintain the place
of the user within each data set
a kind of cursor which is different or can be synced across
different data types and representations, eg pdf viewed vs file list vs image gallery

can we chain readable/writable?
so readable(value) internally updates
then writable calls readable's values for those datasets
*/

import { writable } from 'svelte/store';

import * as bookmarks from "./apis/bookmarks.js";
import * as proxy from "./apis/proxy.js";
import * as tabs from "./apis/tabs.js";

import * as network from "./network.js";
import * as send from "./send.js";


import { workspaceConfig } from "../workspace.js";


export const localStorageFor = (name, otherwise={}) => {
  return Promise.resolve(`${name}`)
    .then(browser.storage.local.get)
    .catch(print.failure_storage_for)
    .then(_ => otherwise)
};

export const bookmarksFor = (name, otherwise={}) => {
  return Promise.resolve(name)
    .then(bookmarks.search)
    .catch(proxy.print.failure_bookmarks_for)
};

const configWritable = writable(workspaceConfig);
const layoutItemsWritable = writable(bookmarksFor("layoutItems", { items: [], add: [] }));

export const stores = {
  config: configWritable,
  // todo: todoWritable,
  // actionHistory: actionHistoryWritable,
  // eventLog: eventLogWritable,
  layoutItems: layoutItemsWritable,
  // files: filesWritable,
};


Object.entries(stores).forEach((entry) => {
  let name = entry[0];
  let store = entry[1];
  store.subscribe((val) => {
    if (val !== undefined && val !== "undefined") {
      return Promise.resolve({ name: val })
        .then(bookmarks.search)
        .then(proxy.print.success_storage_bookmarks)
        .catch(proxy.print.failure_storage_bookmarks);
    }
  });
});

// --- Approach for localStorage


// export const stores = {
//   config: configWritable,
//   todo: todoWritable,
//   actionHistory: actionHistoryWritable,
//   eventLog: eventLogWritable,
//   layoutItems: layoutItemsWritable,
//   files: filesWritable,
// };

// const configWritable = writable(workspaceConfig); // localStorageFor("config",
// const actionHistoryWritable = writable(localStorageFor("actionHistory", []));
// const eventLogWritable = writable(localStorageFor("eventLog", []));
// const layoutItemsWritable = writable(localStorageFor("layoutItems", { items: [], add: [] }));
// const todoWritable = writable(localStorageFor("todo", []));
// const filesWritable = writable(localStorageFor("files"));

// export const localStorageFor = (name, otherwise={}) => {
//   return Promise.resolve(`${name}`)
//     .then(browser.storage.local.get)
//     .catch(proxy.print.failure_storage_for)
//     .then(_ => otherwise)
// };

// export const storageFor = (name, otherwise={}) => {
//   return Promise.resolve(`${name}`)
//     .then(browser.storage.local.get)
//     .catch(proxy.print.failure_storage_for)
//     .then(_ => otherwise)
// };

// Object.entries(stores).forEach((entry) => {
//   let name = entry[0];
//   let store = entry[1];
//   store.subscribe((val) => {
//     if (val !== undefined && val !== "undefined") {
//       return Promise.resolve({ name: val })
//         .then(proxy.print.status_storage)
//         // .then(pruneMethods)
//         .then(browser.storage.local.set)
//         .catch(proxy.print.failure_status_store);
//     }
//   });
// });



// -- subscriptions

// stores.layoutItems.subscribe(val => {
//   console.log("[update] stores.layoutItems update", val)
// });

// stores.config.subscribe((val) => {
//   console.log("[update] stores.workspace update", val);
// });

// stores.eventLog.subscribe((val) => {
//   console.log("[update] stores.eventLog update", val);
//   // if (val && Object.keys(val).length > 0) {
//   //   sendProfileUpdate('action', val);
//   // }
// });

// stores.actionHistory.subscribe((val) => {
//   console.log("[update] stores.actionHistory update", val);
// });


export { stores as default };
