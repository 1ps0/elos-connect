/*
1st order

low order item for configuring the layoutgrid(s). no deeper dependencies that point to higher order
- TODO icon dependency
*/

// LAYOUT GRID
export let panelGap = 10;
export let columnMultiplier = 3;
export let columnCount = 40;
export let rowHeight = 100;

// GRID MENU PANEL
export const menuItems = [
  // {
  //   name: "",
  //   value: { icon: "", highlight: "" }
  // },
  {
    name: "panel-layouts",
    value: { icon: "view-modes", highlight: "A toolbar to choose layout modes and panel indices" }
  },
  {
    name: "panel-metrics",
    value: { icon: "table", highlight: "Metrics"},
  },
  {
    name: "panel-files",
    value: { icon: "files", highlight: "File List"},
  },
  {
    name: "panel-filetypes",
    value: { icon: "tools", highlight: "Filetype List (with counts)"},
  },
  {
    name: "panel-pdf",
    value: { icon: "pdf", highlight: "iFrame for PDF"},
  },
  {
    name: "panel-editor",
    value: { icon: "code", highlight: "Code or MD Editor"},
  },
  {
    name: "panel-gallery",
    value: { icon: "image", highlight: "Image Gallery"},
  },
  {
    name: "panel-create",
    value: { icon: "action-add", highlight: "Package Creation Wizard"},
  },
  {
    name: "panel-pkgindex",
    value: { icon: "packages", highlight: "Package List"},
  },
  {
    name: "panel-session",
    value: { icon: "view-mode-workspaces", highlight: "New Session/Workspace"},
  },
  {
    name: "panel-entryform",
    value: { icon: "view-mode-2", highlight: "Add Data"},
  },
  {
    name: "panel-eventhistory",
    value: { icon: "view-mode-layers", highlight: "Event History"},
  },
];
