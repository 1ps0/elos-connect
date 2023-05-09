``;

import * as proxy from "./proxy.js";
// -- render functions

const walkNodes = (walker) => {
  let nodes = [];
  while ((node = walker.nextNode())) {
    nodes.push([node.name, node.data]);
  }
  return nodes;
};

// ---- reduce

export const CSVToJSON = (data) => {
  // FIXME
  return data;
};

export const playing = (tabs, obj) => {
  if (!tabs) {
    return null;
  }
  if (!obj) {
    obj = {};
  }
  return tabs.reduce((_out, curr) => {
    if (!_out[curr.name]) {
      _out[curr.name] = curr;
    }
    return _out;
  }, obj);
};

export const documentText = () => {
  return Promise.resolve()
    .then((_) => [document, window.NodeFilter.SHOW_TEXT, null, false])
    .then(document.createTreeWalker)
    .then(walkNodes)
    .then(proxy.print.success)
    .catch(proxy.print.failure_reduce_document_text);
};

export const tab = (tab) => {
  return Promise.resolve(tab)
    .then((_tab) => ({
      uri: tab.url,
      url: tab.url,
      label: tab.title,
      title: tab.title,
      tabId: tab.id,
      windowId: tab.windowId,
      muted: tab.mutedInfo.muted,
      playing: tab.audible,
      article: tab.isArticle,
      timestamp: Date.now(),
      // icon: tab.favIconUrl, // spammy base64 rendering
      // language: browser.tabs.detectLanguage(tab.id)
    }))
    .catch(proxy.print.failure_reduce_tab);
};

// tabtab tab: tab tabity, tabbbbbbbb;
export const tabs = (_tabs) => {
  return Promise.resolve(_tabs)
    .then((_tabs) => _tabs.map(tab))
    .then(Promise.all)
    .catch(proxy.print.failure_reduce_tabs);
};
