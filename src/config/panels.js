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

export let panelTypes = {
  "panel-layouts": {
    visible: true,
    target: "toolbar",
    name: "toolbar",
    w: columnMultiplier*4,
    h: 1,
    componentName: "toolbar"
  },
  "panel-filetypes": {
    visible: true,
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
  "panel-eventhistory": {
    visible: false,
    target: "panel-eventhistory",
    name: "eventhistory",
    w: columnMultiplier*2,
    componentName: "itemlist",
    props: {
      readonly: true,
      dataStore: "history"
    }
  },
  "panel-actionhistory": {
    visible: false,
    target: "panel-actionhistory",
    name: "actionhistory",
    w: columnMultiplier*3,
    componentName: "itemlist",
    props: {
      readonly: true,
      dataStore: "log"
    }
  },
  "panel-clock": {
    visible: true,
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
    visible: true,
    target: "panel-timer",
    name: "timer",
    w: columnMultiplier * 5,
    h: 4,
    componentName: "timer",
    props: {}
  },
  "panel-todo": {
    visible: true,
    target: "panel-todo",
    name: "todo",
    w: columnMultiplier*5,
    componentName: "todo",
    dependents: [ "panel-timer", "panel-eventhistory" ],
    props: {}
  },
  "panel-polls": {
    visible: true,
    target: "panel-polls",
    name: "polls",
    w: columnMultiplier*5,
    componentName: "poll",
    props: {}
  },
  "panel-commandbar": {
    visible: true,
    target: "panel-commandbar",
    name: "commandbar",
    w: columnMultiplier * 5,
    h: 1,
    componentName: "commandbar",
    props: { overflow: 'visible' }
  },
  "panel-mainmenu": {
    visible: true,
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
  "panel-files": {
    visible: true,
    target: "panel-files",
    name: "files",
    w: columnMultiplier*6,
    toolbar: {},
    componentName: "files",
    event: { name: 'openFile', callback: "openFile" },
    dependents: [ "panel-filetypes" ]
  },
  "panel-panelhistory": {
    visible: true,
    target: "panel-panelhistory",
    name: "history",
    w: columnMultiplier*3,
    componentName: "itemlist"
  },
  "panel-metrics": {
    visible: true,
    target: "panel-metrics",
    name: "metrics",
    w: columnMultiplier*4,
    componentName: "datagrid",
  },
  "panel-pdf": {
    visible: false,
    target: "panel-pdf",
    name: "pdf",
    w: columnMultiplier*5,
    componentName: "pdf",
  },
  "panel-editor": {
    visible: true,
    target: "panel-editor",
    name: "editor",
    w: columnMultiplier*5,
    componentName: "editor",
  },
  "panel-gallery": {
    visible: true,
    target: "panel-gallery",
    name: "gallery",
    w: columnMultiplier*5,
    componentName: "imagegallery",
    props: {
      dataStore: "files"
    }
  },
  "panel-entryform": {
    visible: true,
    target: "panel-entryform",
    name: "entryform",
    w: columnMultiplier*5,
    componentName: "entryform",
  },
  "panel-pkgindex": {
    visible: false,
    target: "panel-pkgindex",
    name: "pkgindex",
    w: columnMultiplier*8,
    componentName: "pkgindex",
  },
  "panel-create": {
    visible: false,
    target: "panel-create",
    name: "create",
    w: columnMultiplier*5,
    componentName: "pkgcreate",
  }
};
