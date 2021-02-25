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
    w: columnMultiplier*3,
    componentName: "itemlist",
    props: {
      readonly: true,
      dataStore: "log"
    }
  },
  "panel-journal": {
    target: "panel-journal",
    name: "journal",
    w: columnMultiplier*6,
    componentName: "expandlist",
    props: {
      readonly: true,
      dataStore: "profile",
      dataKey: "journal",
      transform: ((x) => x.data)
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
      dataStore: "files"
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
