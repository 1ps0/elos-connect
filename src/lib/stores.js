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
import { workspaceConfig } from "../workspace.js";


export const storageFor = (name, otherwise={}) => {
  return Promise.resolve(`${name}`)
    .then(browser.storage.local.get)
    .catch(print.failure_storage_for)
    .then(_ => otherwise)
};

const configWritable = writable(storageFor("config", workspaceConfig));
const actionHistoryWritable = writable(storageFor("actionHistory", []));
const eventLogWritable = writable(storageFor("eventLog", []));
const layoutItemsWritable = writable(storageFor("layoutItems", { items: [], add: [] }));
const todoWritable = writable(storageFor("todo", []));
const filesWritable = writable(storageFor("files"));

export const stores = {
  config: configWritable,
  todo: todoWritable,
  actionHistory: actionHistoryWritable,
  eventLog: eventLogWritable,
  layoutItems: layoutItemsWritable,
  files: filesWritable,
};

Object.entries(stores).forEach((entry) => {
  let name = entry[0];
  let store = entry[1];
  store.subscribe((val) => {
    if (val !== undefined && val !== "undefined") {
      return Promise.resolve({ name: val })
        .then(print.status_storage)
        // .then(pruneMethods)
        .then(browser.storage.local.set)
        .catch(print.failure_status_store);
    }
  });
});

export { stores as default };
