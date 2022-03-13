/*
3rd order item for managing workspace objects
*/


// WORKSPACE

export let workspaceConfig = {
  loadedAt: new Date(),
  version: '0.0.7-prealpha',
  config: {
    logs: {
      level: "debug",
      target: "local",
    },

  },
  host: {
    name: "localhost",
    uri: "http://localhost:3000",
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

