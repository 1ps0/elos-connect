/*
1st order

low order item for configuring the layoutgrid(s). no deeper dependencies that point to higher order
- TODO icon dependency
*/

// LAYOUT GRID
export let panelGap = 10;
export let columnMultiplier = 6;
export let columnCount = 100;
export let rowHeight = 65;

// GRID MENU PANEL
export const menuItems = [
  {
    name: "panel-todo",
    value: { icon: "list", highlight: "TODO List"},
    group: "1"
  },
  {
    name: "panel-polls",
    value: { icon: "polls", highlight: "Polls"},
    group: "1"
  },
  {
    name: "panel-timer",
    value: { icon: "task-add", highlight: "Timer"},
    group: "1"
  },
  {
    name: "panel-metrics",
    value: { icon: "table", highlight: "Metrics"},
    group: "1"
  },
  {
    name: "panel-entryform",
    value: { icon: "action-add", highlight: "Add Data"},
    group: "1"
  },
  {
    name: "panel-eventhistory",
    value: { icon: "view-mode-1", highlight: "Event History"},
    group: "1"
  },
  {
    name: "panel-actionhistory",
    value: { icon: "view-mode-2", highlight: "action History"},
    group: "2"
  },
  {
    name: "panel-layouts",
    value: { icon: "view-modes", highlight: "A toolbar to choose layout modes and panel indices" },
    group: "2"
  },
  {
    name: "panel-filetypes",
    value: { icon: "tools", highlight: "Filetype List (with counts)"},
    group: "3"
  },
  {
    name: "panel-files",
    value: { icon: "files", highlight: "File List"},
    group: "3"
  },
  {
    name: "panel-pkgindex",
    value: { icon: "packages", highlight: "Package List"},
    group: "3"
  },
  {
    name: "panel-create",
    value: { icon: "action-add", highlight: "Package Creation Wizard"},
    group: "3"
  },
  {
    name: "panel-pdf",
    value: { icon: "pdf", highlight: "iFrame for PDF"},
    group: "4"
  },
  {
    name: "panel-editor",
    value: { icon: "code", highlight: "Code or MD Editor"},
    group: "4"
  },
  {
    name: "panel-gallery",
    value: { icon: "image", highlight: "Image Gallery"},
    group: "4"
  },
];
