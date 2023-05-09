/*
1st order

low order item for configuring the layoutgrid(s). no deeper dependencies that point to higher order
- TODO icon dependency
*/

export const actionItems = [
  {
    name: "action-compact",
    value: { icon: "view-mode-2", highlight: "Move panels in close together." },
    group: "1",
  },
  // {
  //   name: "action-",
  //   value: { icon: "view-mode-2", highlight: "Move panels in close together." },
  //   group: "1"
  // },
];

// GRID MENU PANEL
export const menuItems = [
  {
    name: "panel-actionmenu",
    value: { icon: "view-mode-2", highlight: "Menu of Browser Actions" },
    group: "1",
  },
  {
    name: "panel-dashboard",
    value: { icon: "composite", highlight: "Dashboard" },
    group: "1",
  },
  {
    name: "panel-config",
    value: { icon: "settings", highlight: "Settings and Config" },
    group: "1",
  },
  {
    name: "panel-web-players",
    value: { icon: "view-modes", highlight: "Web Players" },
    group: "1",
  },
  {
    name: "panel-playlists",
    value: { icon: "table", highlight: "Playlists" },
    group: "1",
  },
  {
    name: "panel-focus",
    value: { icon: "status-pin", highlight: "Focus" },
    group: "1",
  },
  {
    name: "panel-timer",
    value: { icon: "task-add", highlight: "Pomodoro Timer" },
    group: "1",
  },
  {
    name: "panel-entryform",
    value: { icon: "action-add", highlight: "Add Data" },
    group: "1",
  },
  {
    name: "panel-todo",
    value: { icon: "list", highlight: "TODO List" },
    group: "1",
  },
];
