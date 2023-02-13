
import * as network from "./network.js";

// ---------- Load composites

export const loadTags = async () => {
  return Promise.resolve({ uri:'api/analysis/tag'})
    .then(network._fetch)
    .then((results) => results.names.map((tag) => tag[1]))
    .catch(proxy.print.failure_load_tabs);
};

export const loadSites = async () => {
  return browser.topSites.get()
    .then((sites) => {
      return sites;
    })
    .then((sites) => {
      return sites.map((site) => ({
        title: site.title,
        url: site.url
      }));
    })
    .then((sites) => {
      return {
        elementId: 'item-list',
        sites: sites,
      }
    })
    .catch(proxy.print.failure_load_sites);
}

export const loadSessions = async () => {
  return browser.sessions.getRecentlyClosed()
    .then((sessions) => {
      return sessions.map((session) => ({

      }))
    })
    .then(proxy.print.success)
    .catch(proxy.print.failure_load_sessions);
}

export const loadVisits = async (params) => {
  return browser.history.getVisits(params)
    .catch(proxy.print.failure_load_visits);
}

export const loadHistory = async (params) => {
  // params can only be { url: string }
  return browser.history.search({
      text: params && params.query ? params.query : "",
      startTime: params && params.startTime ? params.startTime : 0, // default 24h window
      // maxResults: params && params.resultCount ? params.resultCount :
    })
    .then((historyItems) => {
      return historyItems.map((item) => ({
        id: item.id,
        url: item.url,
        title: item.title,
        lastVisitTime: item.lastVisitTime, // page was last loaded, in milliseconds since the epoch.
        visitCount: item.visitCount, // has visited the page.
        typedCount: item.typedCount // navigated to this page by typing in the address.
      }));
    })
    .catch(proxy.print.failure_load_history);
}

// web_accessible_resources
// browser.extension.getURL("beasts/frog.jpg");

export const loadCommands = (params) => {
  return browser.commands.getAll()
    .then((cmds) => {
      return cmds.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        shortcut: cmd.shortcut
      }))
    })
    .catch(proxy.print.failure_load_commands);
}
