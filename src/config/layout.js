/*
1st order

low order item for configuring the layoutgrid(s). no deeper dependencies that point to higher order
- TODO icon dependency
*/


// GRID MENU PANEL
export const menuItems = [
  {
    name: "panel-actionmenu",
    value: { icon: "view-mode-2", highlight: "Menu of Browser Actions" },
    group: "1"
  },
  {
    name: "panel-web-players",
    value: { icon: "view-modes", highlight: "Web Players" },
    group: "1"
  },
  {
    name: "panel-location-ops",
    value: { icon: "view-mode-1", highlight: "Location Tagging" },
    group: "1"
  },
  {
    name: "panel-timer",
    value: { icon: "task-add", highlight: "Pomodoro Timer"},
    group: "1"
  },
  {
    name: "panel-entryform",
    value: { icon: "action-add", highlight: "Add Data"},
    group: "1"
  },
  {
    name: "panel-todo",
    value: { icon: "list", highlight: "TODO List"},
    group: "1"
  },
  {
    name: "panel-journal",
    value: { icon: "polls", highlight: "Journal"},
    group: "1"
  },
  // {
  //   name: "panel-eventhistory",
  //   value: { icon: "view-mode-1", highlight: "Event History"},
  //   group: "1"
  // },
  // {
  //   name: "panel-actionhistory",
  //   value: { icon: "view-mode-2", highlight: "Action History"},
  //   group: "2"
  // },
  {
    name: "panel-locations",
    value: { icon: "view-mode-3", highlight: "File/URL locations"},
    group: "2"
  },
  // {
  //   name: "panel-storybook",
  //   value: { icon: "table", highlight: "Storybook Template"},
  //   group: "2"
  // }
  // {
  //   name: "panel-drop",
  //   value: { icon: "table", highlight: "File/URL drop"},
  //   group: "2"
  // },
  // {
  //   name: "panel-layouts",
  //   value: { icon: "view-modes", highlight: "A toolbar to choose layout modes and panel indices" },
  //   group: "2"
  // },
  // {
  //   name: "panel-filetypes",
  //   value: { icon: "tools", highlight: "Filetype List (with counts)"},
  //   group: "3"
  // },
  // {
  //   name: "panel-files",
  //   value: { icon: "files", highlight: "File List"},
  //   group: "3"
  // },
  // {
  //   name: "panel-pkgindex",
  //   value: { icon: "packages", highlight: "Package List"},
  //   group: "3"
  // },
  // {
  //   name: "panel-create",
  //   value: { icon: "action-add", highlight: "Package Creation Wizard"},
  //   group: "3"
  // },
  // {
  //   name: "panel-pdf",
  //   value: { icon: "pdf", highlight: "iFrame for PDF"},
  //   group: "4"
  // },
  // {
  //   name: "panel-editor",
  //   value: { icon: "code", highlight: "Code or MD Editor"},
  //   group: "4"
  // },
  // {
  //   name: "panel-gallery",
  //   value: { icon: "image", highlight: "Image Gallery"},
  //   group: "4"
  // },
];

/*
"panel-layouts": { visible: true,
"panel-filetypes": { visible: true,
"panel-eventhistory": { visible: false,
"panel-actionhistory": { visible: false,
"panel-clock": { visible: true,
"panel-timer": { visible: true,
"panel-todo": { visible: true,
"panel-polls": { visible: true,
"panel-commandbar": { visible: true,
"panel-mainmenu": { visible: true,
"panel-files": { visible: true,
"panel-panelhistory": { visible: true,
"panel-metrics": { visible: true,
"panel-pdf": { visible: false,
"panel-editor": { visible: true,
"panel-gallery": { visible: true,
"panel-entryform": { visible: true,
"panel-pkgindex": { visible: false,
"panel-create": { visible: false,
*/