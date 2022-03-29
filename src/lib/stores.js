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

import { writable, get } from 'svelte/store';
import { workspaceConfig } from "../workspace.js";


export const storageFor = (name, otherwise={}) => {
  return Promise.resolve(`${name}`)
    .then(browser.storage.local.get)
    .catch(print.failure_storage_for)
    .then(_ => otherwise)
};

export const configWritable = writable(workspaceConfig);

export const historyWritable = writable(storageFor("history", []));

export const trackedWritable = writable(storageFor("tracked", {}));

export const logWritable = writable(storageFor("log", {}));

export const filesWritable = writable(storageFor("files"));
export const layoutItemsWritable = writable(storageFor("layoutItems", { items: [], add: [] }));

export const contentWritable = writable(storageFor("content"));
export const profileWritable = writable(storageFor("profile"));
export const todoWritable = writable(storageFor("todo", []));
export const pollsWritable = writable(storageFor("polls", []));

export const registeredActions = writable({});

export const commandOptionsWritable = writable({
  polls: () => storageFor("polls"),
  todo: () => storageFor("todo"),
  workspace: () => storageFor("workspace"),
  history: () => storageFor("history"),
  tracked: () => storageFor("tracked"),
  log: () => storageFor("log"),
  layoutItems: () => storageFor("layoutItems"),
  profile: () => storageFor("profile"),
  actions: () => registeredActions,
  links: () => writable({}),
  files: () => storageFor("files", {
    files: [],
    filetype: "md",
    keywords: "",
    pageNum: 1,
    pageSize: 10,
    dirty: false
  }),
})

export const stores = {
  // tmp data
  todo: todoWritable,
  polls: pollsWritable,
  history: historyWritable,
  tracked: trackedWritable,
  log: logWritable,
  content: contentWritable,
  layoutItems: layoutItemsWritable,
  // config data
  config: configWritable,
  // api data
  files: filesWritable,
  profile: profileWritable,
  // local actions
  actions: registeredActions,
  commandOptions: commandOptionsWritable,
};
for (let name in stores) {
  stores[name].subscribe((val) => {
    if (val !== undefined && val !== "undefined") {
      return Promise.resolve({ name: val })
        .then(print.status_storage)
        // .then(pruneMethods)
        .then(browser.storage.local.set)
        .catch(print.failure_status_store);
    }
  });
}

export const syncLocal = () => {};
export const syncRemote = () => {};









