// 2nd order

import { menuItems } from "./layout.js";

/*
Item Interface:
menu_item: true,
bind: { name, callback },
event: { name, callback },
props: { prop1: value1, ...},
name: eg label, display name
target: eg id, target value for types
*/

// FIXME centralize and reactivize configs like this
export const layoutConfig = {
  // LAYOUT GRID
  panelGap: 5,
  columnMultiplier: 6,
  columnCount: 100,
  rowHeight: 65,
};


export const optionTypes = {
  close: {
    title: 'close',
    icon: "status-closemark"
  },
  // pin: {
  //   title: 'pin',
  //   icon: "status-pin"
  // }
};

export const panelTypes = {
  "panel-mainmenu": {
    target: "panel-mainmenu",
    name: "mainmenu",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*11,
    h: 2,
    componentName: "selectlist",
    event: { name: 'menuToggle', callback: "togglePanel" },
    props: {
      eventName: "menuToggle",
      items: menuItems,
      transform: (e) => { return e.value.icon }
    }
  },
  "panel-actionmenu": {
    target: "panel-actionmenu",
    name: "actionmenu",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*4,
    h: 3,
    componentName: "actionmenu",
  },
  "panel-location-ops": {
    target: "panel-location-ops",
    name: "location-ops",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*4,
    h: 6,
    componentName: "location_ops"
  },
  "panel-web-players": {
    target: "panel-web-players",
    name: "web_players",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier * 6,
    h: 5,
    componentName: "web_players",
    event: {
      name: 'filterType',
      callback: 'updateLocations'
    },
    props: {
      eventName: "playPause",
      transform: ((e) => e)
    }
  },
  "panel-commandbar": {
    target: "panel-commandbar",
    name: "commandbar",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier * 5,
    h: 1,
    componentName: "commandbar",
    props: { overflow: 'visible' }
  },
  "panel-layouts": {
    target: "toolbar",
    name: "toolbar",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*4,
    h: 1,
    componentName: "toolbar"
  },
  "panel-clock": {
    target: "panel-clock",
    name: "clock",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier * 5,
    h: 1,
    componentName: "clock",
    props: {
      timezone: "PST"
    }
  },
  "panel-timer": {
    target: "panel-timer",
    name: "timer",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier * 2,
    h: 4,
    componentName: "timer",
  },
  "panel-todo": {
    target: "panel-todo",
    name: "todo",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*3,
    componentName: "todo",
    // dependents: [
    //   "panel-timer",
    //   "panel-eventhistory"
    // ],
    props: {}
  },
  "panel-cando-list": {
    target: "panel-cando-list",
    name: "cando-list",
    componentName: "rotatelist",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*6,
    h: 8,
    props: {
      dataKey: "baitlist",
      dataStore: "profile"
    }
  },
  "panel-entryform": {
    target: "panel-entryform",
    name: "entryform",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*6,
    h: 8,
    componentName: "entryform",
    props: {
      dataStore: "profile"
    }
  },
  "panel-tracked": {
    target: "panel-tracked",
    name: "tracked",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*4,
    h: 8,
    componentName: "tracker",
    props: {
      dataStore: "tracked"
    }
  },
  "panel-drop": {
    target: "panel-drop",
    name: "drop",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*4,
    h: 8,
    componentName: "drop",
    props: {
      dataStore: "files"
    }
  },
  "panel-eventhistory": {
    target: "panel-eventhistory",
    name: "eventhistory",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*2,
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
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*8,
    componentName: "chart",
    props: {
      readonly: true,
      dataStore: "log"
    }
  },
  "panel-tags": {
    target: "panel-tags",
    name: "tags",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*3,
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
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*6,
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
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*6,
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
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*3,
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
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*6,
    toolbar: {},
    componentName: "files",
    event: { name: 'openFile', callback: "openFile" },
    // dependents: [ "panel-filetypes" ]
  },
  "panel-panelhistory": {
    target: "panel-panelhistory",
    name: "history",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*3,
    componentName: "itemlist"
  },
  "panel-metrics": {
    target: "panel-metrics",
    name: "metrics",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*8,
    componentName: "datagrid",
    props: {
      dataStore: "profile",
      dataKey: "metrics"
    }
  },
  "panel-pdf": {
    target: "panel-pdf",
    name: "pdf",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*5,
    componentName: "pdf",
  },
  "panel-editor": {
    target: "panel-editor",
    name: "editor",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*5,
    componentName: "editor",
  },
  "panel-gallery": {
    target: "panel-gallery",
    name: "gallery",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*5,
    componentName: "imagegallery",
    props: {
      dataStore: "files",
      dataSourcePath: "/api/file/search",
    }
  },
  "panel-pkgindex": {
    target: "panel-pkgindex",
    name: "pkgindex",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*8,
    componentName: "pkgindex",
  },
  "panel-create": {
    target: "panel-create",
    name: "create",
    w: layoutConfig.columnCount, //layoutConfig.columnMultiplier*5,
    componentName: "pkgcreate",
  }
};
