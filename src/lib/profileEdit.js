
/*

ProfileEdit control


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


export function profileEdit(node, params) {

  const dispatch = createEventDispatcher();

  const openProfile = (e) => {
    e.preventDefault();
    console.log("got command submit", e);
    // dispatch('openFile', {
    //   source: "fileset",
    //   data: file
    // });

  }
  node.addEventListener('click', openProfile);

  return {
    update(newFile) {
      console.log("profileEdit got update", newFile);
    },
    destroy() {
      console.log("profileEdit is destroyed");
      node.removeListener('click', openProfile);
    }
  };
}
