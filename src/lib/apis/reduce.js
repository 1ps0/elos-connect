
import * as proxy from "./proxy.js";
import * as _tabs from "./tabs.js"; // _tabs for function name collision

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
    return {};
  }
  return _tabs.reduce((_out, curr) => {
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

// tabtab tab: tab tabity, tabbbbbbbb;
export const tabs = (_tabs) => {
  return Promise.resolve(_tabs)
    .then(__tabs => __tabs.map(_tabs.reduce))
    // .then(proxy.print.status_reduce_tabs)
    // .then(Promise.all)
    .catch(proxy.print.failure_reduce_tabs);
};
