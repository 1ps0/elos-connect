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
import { workspaceConfig } from "../config/parameters.js";

export const cacheFor = (name, otherwise={}) => {
  let ret = localStorage.getItem(`${name}_cache`);
  return ret ? JSON.parse(ret) : otherwise;
};

export const workspaceWritable = writable(workspaceConfig);

export const historyWritable = writable(cacheFor("history", []));

export const trackedWritable = writable(cacheFor("tracked", {}));

export const logWritable = writable(cacheFor("log", {}));

export const filesWritable = writable(cacheFor("files"));
export const layoutItemsWritable = writable(cacheFor("layoutItems", { items: [], add: [] }));

export const profileWritable = writable(cacheFor("profile"));
export const todoWritable = writable(cacheFor("todo", []));
export const pollsWritable = writable(cacheFor("polls", []));

export const registeredActions = writable({});

export const commandOptionsWritable = writable({
  polls: () => cacheFor("polls"),
  todo: () => cacheFor("todo"),
  workspace: () => cacheFor("workspace"),
  history: () => cacheFor("history"),
  tracked: () => cacheFor("tracked"),
  log: () => cacheFor("log"),
  layoutItems: () => cacheFor("layoutItems"),
  profile: () => cacheFor("profile"),
  actions: () => registeredActions,
  links: () => writable({}),
  files: () => cacheFor("files", {
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
  layoutItems: layoutItemsWritable,
  // config data
  workspace: workspaceWritable,
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
      localStorage.setItem(`${name}_cache`, JSON.stringify(val));
    }
  });
}


