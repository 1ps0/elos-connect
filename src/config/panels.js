// 2nd order

import { menuItems, actionItems } from "./layout.js";

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
  mode: "full-width", // default, full-width, full-height, full-screen
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

const columnForConfig = (config, columns) => {
  return config.mode === "full-width" ? config.columnCount : columns;
}

export const panelTypes = {
  "panel-mainmenu": {
    target: "panel-mainmenu",
    name: "mainmenu",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*11,),
    h: 2,
    componentName: "selectlist",
    event: { name: 'menuToggle', callback: "togglePanel" },
    props: {
      showIn: "sidebar",
      eventName: "menuToggle",
      items: menuItems,
      transform: (e) => { return e.value.icon }
    }
  },
  "panel-layout": {
    target: "panel-layout",
    name: "layout",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*11,),
    h: 2,
    componentName: "selectlist",
    event: { name: 'layoutAction', callback: "alignPanel" },
    props: {
      showIn: "sidebar",
      eventName: "layoutAction",
      items: actionItems,
      transform: (e) => { return e.value.icon }
    }
  },
  "panel-dashboard": {
    target: "panel-dashboard",
    name: "dashboard",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*4,),
    h: 5,
    componentName: "dashboard",
    props: {
      showIn: "tab"
    }
  },
  "panel-config": {
    target: "panel-config",
    name: "config",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*4,),
    h: 5,
    componentName: "config",
    props: {
      showIn: "tab"
    }
  },
  "panel-focus": {
    target: "panel-focus",
    name: "focus",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*4,),
    h: 5,
    componentName: "focus",
  },
  "panel-actionmenu": {
    target: "panel-actionmenu",
    name: "actionmenu",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*4,),
    h: 3,
    componentName: "actionmenu",
  },
  "panel-web-players": {
    target: "panel-web-players",
    name: "web_players",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier * 6,),
    h: 3,
    componentName: "web_players",
    event: {
      name: 'filterType',
      callback: 'updateLocations'
    },
    props: {
      eventName: "media.playPause",
      transform: ((e) => e)
    }
  },
  "panel-playlists": {
    target: "panel-playlists",
    name: "playlists",
    w: columnForConfig(layoutConfig),
    h: 4,
    componentName: "playlists",
  },
  "panel-timer": {
    target: "panel-timer",
    name: "timer",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier * 2,),
    h: 4,
    componentName: "timer",
  },
  "panel-todo": {
    target: "panel-todo",
    name: "todo",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*3,),
    h: 5,
    componentName: "todo",
  },
  "panel-eventlog": {
    target: "panel-eventlog",
    name: "eventlog",
    w: columnForConfig(layoutConfig, layoutConfig.columnMultiplier*2,),
    h: 3,
    componentName: "itemlist",
    props: {
      readonly: true,
      dataStore: "eventLog",
      transform: (x) => `${x.name} @ ${x.at[1]} `,
      transforms: {
        title: (x) => `${x.name} @ ${x.at[1]} `,
        api: (x) => x,
      }
    }
  },
};
