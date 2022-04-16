
import { createEventDispatcher } from 'svelte';
import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { stores } from "./lib/stores.js"
;
export let selectedFiles = [];
export const fileSelect = (node, params) => {
  return {
    update(val) {

    },
    destroy() {

    }
  };
};

export function fileList(node, file) {
  const dispatch = createEventDispatcher();
  // const actionHistoryWritable = getContext("eventHistory");
  // const registeredActions = getContext("registeredActions");
  // const fileTypeWritable = getContext("filetypes");
  // const filesWritable = getContext("files");

  let metadata = {
    pageSize: 10,
    pageNum: 1,
    filetype: 'md',
    keywords: ''
  };

  console.log("processed metadata", data, files, metadata);

  // node.addEventListener('click', openFileHandler);

  // console.log("fileList found", node, file);

  // filetypeWritable.subscribe( (val) => {
  //   console.log("sub:fileset:filetypes", val, metadata);
  //   fetchFileList({ ...metadata, filetype: val });
  // });

  return {
    update(newFile) {
      // console.log("fileList got update", newFile);
      // file = newFile;
    },
    destroy() {
      console.log("fileList is destroyed");
      // node.removeEventListener('openFile', _handler);
    }
  };
};
