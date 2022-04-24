/*
3rd order item for managing workspace objects
*/


// WORKSPACE

export let workspaceConfig = {
  loadedAt: new Date(),
  version: '0.0.9-prealpha',
  config: {
    logs: {
      level: "debug",
      target: "local",
    },

  },
  host: {
    name: "localhost",
    // uri: "http://localhost:3000",
    uri: "http://192.168.99.156:3000",
    search: "/api/search",
  },
  activePlaylist: {
    notes: {},
    items: {},
  },
  playlistHistory: [],
  recentlySaved: [],
  todo: {},
  journal: [],

};

