/*
3rd order item for managing workspace objects
*/


// WORKSPACE

export const workspaceConfig = {
  loadedAt: new Date(),
  version: '0.0.9-prealpha',
  logs: {
    level: "debug",
    target: "local",
  },
  notify: {
    level: "error",
    target: "remote",
  },
  hosts: {
    local: {
      name: "localhost",
      active: true,
      default: true,
      uri: "http://localhost:3000",
      search: "/api/search",
    },
    remote: {
      name: "remote-1",
      active: false,
      default: false,
      uri: "http://192.168.99.156:3000",
      search: "/api/search",
    },
  },
  activePlaylist: {
    notes: {}, // browser.tabs.getHighlighted(tab.id), textfield input (markdown editor)
    items: {},
    tags: [], // all tags found/used,
  },
  playlistHistory: [],
  recentlySaved: [],
  todo: {},
  journal: [],

};

