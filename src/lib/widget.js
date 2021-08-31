
import { createEventDispatcher } from 'svelte';
import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

export function _() {};

let config = {
  dataKey: "",
  dataSourcePath: "",
  dataStorePath: "",
  "panel-locations": {
      target: "panel-locations",
      name: "locations",
      w: columnMultiplier*6,
      componentName: "itemlist",
      props: {
        readonly: true,
        dataStore: "links",
        dataSourcePath: "/api/location/search",
        titleKey: "label",
        transform: ((x) => x)
      },
      inputs: {
        "panel-tags": 'value',
      }
    },
}

let dataStore = writable({})

// action = (node: HTMLElement, parameters: any) => {
//   update?: (parameters: any) => void,
//   destroy?: () => void
// }
export function widget(node, item) {

  /*
  1. 
  2.

  */

  const dispatch = createEventDispatcher();
  const clickHandler = (e) => {
    e.preventDefault();
    dispatch('activateItem', {
      source: node.name,
      data: item
    });
  }

  // node.addEventListener('click', openProfile);

  return {
    update(newVal) {
      console.log("widget did get update", newVal);
    },
    destroy() {
      console.log("widget was destroyed");
    }
  }
};
