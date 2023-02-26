/*
3rd order item for managing workspace objects
*/


// WORKSPACE

export const workspaceConfig = {
  loadedAt: new Date(),
  version: '0.0.12-prealpha',
  logs: {
    level: "debug",
    target: "local",
    quiet: {
      keywords: [''],
      prefix: ['status', 'success'],
      suffix: ['mounted'],
    },
  },
  notify: {
    level: "error",
    target: "remote",
    quiet: {
      keywords: [''],
      prefix: ['status', 'success'],
      suffix: ['mounted'],
    },
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
  playlist: {
    mine: {
      notes: {}, // browser.tabs.getHighlighted(tab.id), textfield input (markdown editor)
      items: {},
      tags: [], // all tags found/used,
    },
  },
  options: {
    filterby: {
      default: "this",
      handleFailure: "stop.critical" // stop proxy actions for actions or ongoing panel monitoring. like an interrupt
    },

  },
  playlistHistory: [],
  recentlySaved: [],
  todo: {},
  journal: [],

};

