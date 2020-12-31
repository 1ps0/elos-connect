// 2nd order

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

export const profileWritable = writable({});

export const workspaceWritable = writable(workspaceConfig);

export const registeredActions = writable({});

export const historyWritable = writable([]);

export const filesWritable = writable({
  files: [],
  filetype: "md",
  keywords: "",
  pageNum: 1,
  pageSize: 10,
  dirty: false
});

