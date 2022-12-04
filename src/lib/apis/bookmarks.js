
import { print } from "./proxy.js";


export const sendBookmarks = () => {
  return Promise.resolve(params)
    .catch(print.failure_send_bookmarks)
};

export const addBookmark = (params) => {
  return Promise.resolve(params)
    // .then((_params) => {

    // })
    // .then((_params) => ({
    //   tags: _params,
    //   title:
    // }))
    .then(browser.bookmarks.create)
    .catch(print.failure_send_bookmarks)
};

export const renderBranch = (nodes) => {
  return nodes.map((node) => _renderBranch(node, "."));
}

export const _renderBranch = (node, _path) => {
  console.log("rendering node -> ", _path, node)
  if (node.type === "folder") {
    _path = `${_path}/${node.title}`
  }
  if (node.children) {
    return node.children.map((_node) => {
      return _renderBranch(node, `${_path}.${node.title}`)
    });
  } else {
    return {
      path: _path,
      label: node.title,
      uri: node.url,
      index: node.index,
      type: node.type,
      addedAt: node.dateAdded,
      modifiedAt: node.dateGroupModified,
    };
  }
}

export const renderNode = (_path, node) => {
  return {
    path: _path,
    label: node.title,
    uri: node.url,
    index: node.index,
    type: node.type,
    addedAt: node.dateAdded,
    modifiedAt: node.dateGroupModified,
  }
}

const materializeLeafNodes = (node) => {
  let nodes = [];
  let queue = {};
  while (queue.length > 0) {
    // node =
  }
  return nodes;
}

const recurseNodes = (node, path) => {
  let _children = node.children;
  if (!_children)
    return [renderNode(path, node)];

  let nodes = [];
  for (let x = 0; x < _children.length; x++) {
    let _node = _children[x];
    let _path = `${path}/${_node.title}`;
    nodes = nodes.concat(recurseNodes(_node, _path));
  }
  return nodes;
}

export const extractBookmarks = (params) => {
  return browser.bookmarks.getTree()
    .then(node => recurseNodes(node[0], '.'))
    .catch(print.failure_extract_bookmarks)
}

export const getAllBookmarks = (params) => {
  return Promise.resolve(params)
    .then(extractBookmarks)
    .then(print.status_bookmarks_get_tree)
    .catch(print.failure_get_tree);
}

export const importFromStash = (params) => {
  return browser.storage.local.get("stash")
    .then((result) => result.stash)
    .then((stash) => {
      return Object.entries(stash).map((entry) => {
        /*
          1. iterate through node walker
          2. each node with url and title
          3. throw into a bucket hydrated from node
          4. save items into bookmarks within a stash folder
        */
      });
    })
    .catch(print.import_from_stash);
};