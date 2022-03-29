
/*

messenger control
(previously profileEdit)

*/

/*
<Component use:action={parameters}/>
action = (node: HTMLEelement, parameters: any) => {
  update?: (parameters: any) => void,
  destroy?: () => void
}
*/

import { createEventDispatcher } from 'svelte';
import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import {
  bringToFront,
  updatePlaying,
  print
} from "./lib/apis.js";

export function messenger(node, params) {

  const dispatch = createEventDispatcher();

  const _handle = (request, sender, sendResponse) => {

    return sendResponse(True);
  };

  const handleMsg = (e) => {
    e.preventDefault();
    console.log("got command submit", e);
    // dispatch('openFile', {
    //   source: "fileset",
    //   data: file
    // });

  }
  node.addEventListener('click', handleMsg);


  const handlePlayerUpdate = (request, sender, sendResponse) => {
    console.log("Message: ", request, sender);
    return updatePlaying(tabStore)
      .then((params) => ({
        params: params,
        response: "Response from WebPlayers"
      }))
      .then(sendResponse)
      .catch(print.failure);
  };
  browser.runtime.onMessage.addListener(handlePlayerUpdate);

  return {
    update(newFile) {
      console.log("messenger got update", newFile);
    },
    destroy() {
      console.log("messenger is destroyed");
      node.removeListener('click', handleMsg);
    }
  };
}
