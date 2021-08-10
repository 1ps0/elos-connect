// 2nd order

import { menuItems, columnMultiplier } from "./layout.js";

/*
Item Interface:
menu_item: true,
bind: { name, callback },
event: { name, callback },
props: { prop1: value1, ...},
name: eg label, display name
target: eg id, target value for types
*/

export let optionTypes = {
  close: {
    title: 'close',
    icon: "status-closemark"
  },
  // pin: {
  //   title: 'pin',
  //   icon: "status-pin"
  // }
};

export let panelTypes = {
  "panel-mainmenu": {
    target: "panel-mainmenu",
    name: "mainmenu",
    w: columnMultiplier*11,
    h: 1,
    componentName: "selectlist",
    event: { name: 'menuToggle', callback: "togglePanel" },
    props: {
      eventName: "menuToggle",
      items: menuItems,
      transform: (e) => { return e.value.icon }
    }
  },
  "panel-commandbar": {
    target: "panel-commandbar",
    name: "commandbar",
    w: columnMultiplier * 5,
    h: 1,
    componentName: "commandbar",
    props: { overflow: 'visible' }
  },
  "panel-layouts": {
    target: "toolbar",
    name: "toolbar",
    w: columnMultiplier*4,
    h: 1,
    componentName: "toolbar"
  },
  "panel-clock": {
    target: "panel-clock",
    name: "clock",
    w: columnMultiplier * 5,
    h: 1,
    componentName: "clock",
    props: {
      timezone: "PST"
    }
  },
  "panel-timer": {
    target: "panel-timer",
    name: "timer",
    w: columnMultiplier * 2,
    h: 6,
    componentName: "timer",
  },
  "panel-todo": {
    target: "panel-todo",
    name: "todo",
    w: columnMultiplier*3,
    componentName: "todo",
    dependents: [ "panel-timer", "panel-eventhistory" ],
    props: {}
  },
  "panel-cando-list": {
    target: "panel-cando-list",
    name: "cando-list",
    componentName: "rotatelist",
    w: columnMultiplier*6,
    h: 8,
    props: {
      dataKey: "baitlist",
      dataStore: "profile"
    }
  },
  "panel-entryform": {
    target: "panel-entryform",
    name: "entryform",
    w: columnMultiplier*6,
    h: 8,
    componentName: "entryform",
    props: {
      dataStore: "profile"
    }
  },
  "panel-tracked": {
    target: "panel-tracked",
    name: "tracked",
    w: columnMultiplier*4,
    h: 8,
    componentName: "tracker",
    props: {
      dataStore: "tracked"
    }
  },
  "panel-drop": {
    target: "panel-drop",
    name: "drop",
    w: columnMultiplier*4,
    h: 8,
    componentName: "drop",
    props: {
      dataStore: "files"
    }
  },
  "panel-eventhistory": {
    target: "panel-eventhistory",
    name: "eventhistory",
    w: columnMultiplier*2,
    componentName: "itemlist",
    props: {
      readonly: true,
      dataStore: "history",
      transform: (x) => `${x.name} @ ${x.at[1]} `,
      transforms: {
        title: (x) => `${x.name} @ ${x.at[1]} `,
        api: (x) => x,
      }
    }
  },
  "panel-actionhistory": {
    target: "panel-actionhistory",
    name: "actionhistory",
    w: columnMultiplier*8,
    componentName: "chart",
    props: {
      readonly: true,
      dataStore: "log"
    }
  },
  "panel-tags": {
    target: "panel-tags",
    name: "tags",
    w: columnMultiplier*3,
    componentName: "selectlist",
    event: {
      name: 'filterType',
      callback: 'updateLocations'
    },
    props: {
      eventName: 'filterType',
      source: '/api/analysis/tags',
      transform: ((e) => e)
    }
  },
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
    // dependents: [ "panel-tags" ]
  },
  "panel-journal": {
    target: "panel-journal",
    name: "journal",
    w: columnMultiplier*6,
    componentName: "expandlist",
    props: {
      readonly: true,
      dataStore: "profile",
      dataKey: "metrics",
      titleKey: "title",
      transform: ((x) => x)
    }
  },
  "panel-filetypes": {
    target: "panel-filetypes",
    name: "filetypes",
    w: columnMultiplier*3,
    componentName: "selectlist",
    event: {
      name: 'filterType',
      callback: "updateFiletype"
    },
    props: {
      eventName: "filterType",
      source: "/api/file/types",
      transform: ((e) => { return `${e.name} (${e.value})` })
    }
  },
  "panel-files": {
    target: "panel-files",
    name: "files",
    w: columnMultiplier*6,
    toolbar: {},
    componentName: "files",
    event: { name: 'openFile', callback: "openFile" },
    dependents: [ "panel-filetypes" ]
  },
  "panel-panelhistory": {
    target: "panel-panelhistory",
    name: "history",
    w: columnMultiplier*3,
    componentName: "itemlist"
  },
  "panel-metrics": {
    target: "panel-metrics",
    name: "metrics",
    w: columnMultiplier*8,
    componentName: "datagrid",
    props: {
      dataStore: "profile",
      dataKey: "metrics"
    }
  },
  "panel-pdf": {
    target: "panel-pdf",
    name: "pdf",
    w: columnMultiplier*5,
    componentName: "pdf",
  },
  "panel-editor": {
    target: "panel-editor",
    name: "editor",
    w: columnMultiplier*5,
    componentName: "editor",
  },
  "panel-gallery": {
    target: "panel-gallery",
    name: "gallery",
    w: columnMultiplier*5,
    componentName: "imagegallery",
    props: {
      dataStore: "files",
      dataSourcePath: "/api/file/search",
    }
  },
  "panel-pkgindex": {
    target: "panel-pkgindex",
    name: "pkgindex",
    w: columnMultiplier*8,
    componentName: "pkgindex",
  },
  "panel-create": {
    target: "panel-create",
    name: "create",
    w: columnMultiplier*5,
    componentName: "pkgcreate",
  }
};
