import { createEventDispatcher } from "svelte";
import { onMount, setContext, getContext, hasContext } from "svelte";
import { writable, readable, derived, get } from "svelte/store";

export function _() {}

let config = {
  dataKey: "",
  dataSourcePath: "",
  dataStorePath: "",
  "panel-locations": {
    target: "panel-locations",
    name: "locations",
    w: 60,
    componentName: "itemlist",
    props: {
      readonly: true,
      dataStore: "links",
      dataSourcePath: "/api/location/search",
      titleKey: "label",
      transform: (x) => x,
    },
    inputs: {
      "panel-tags": "value",
    },
  },
};

let dataStore = writable({});

// action = (node: HTMLElement, parameters: any) => {
//   update?: (parameters: any) => void,
//   destroy?: () => void
// }
export function _layoutAction(node, items) {
  let _items = writable(items);
  _items.subscribe((val) => {
    if (!val || val.length === 0 || !val.dirty) return;

    let __items = [];
    for (let x = 0; x < val.add.length; x++) {
      let pendingItem = val.add[x];
      __items.push(add(pendingItem[0], pendingItem[1]));
    }
    // items = val.items;
    _items.update((n) => ({ ...n.items, add: [], dirty: false }));
  });

  const onAdd = (val) => {
    console.log("did onAdd", val);
    let item = val.detail;

    if (item && item.event && item.target in objects) {
      objects[item.target].$on(item.event.name, item.event.callback);
    }
  };

  const remove = (item) => {
    // FIXME move object to stasis BEFORE deleting it
    items = items.filter((value) => value.target !== item);
    if (items.length > 0) {
      delete objects[item];
    }
  };

  function togglePanel(e) {
    _togglePanel(e.detail.name);
  }

  function _togglePanel(itemName) {
    let _layout = items.filter((value) => value.target === itemName);
    if (_layout.length > 0) remove(itemName);
    else add(itemName);
  }

  const dispatch = createEventDispatcher();
  const clickHandler = (e) => {
    e.preventDefault();
    dispatch("activateItem", {
      source: node.name,
      data: item,
    });
  };

  // node.addEventListener('click', openProfile);

  return {
    update(newVal) {
      console.log("widget did get update", newVal);
    },
    destroy() {
      console.log("widget was destroyed");
    },
  };
}
