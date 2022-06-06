
import { print } from "./apis.js";

export const sendBookmarks = () => {
  return Promise.resolve(params)
    .catch(print.failure_send_bookmarks)
};

export const addBookmarks = () => {
  return Promise.resolve(params)
    .catch(print.failure_send_bookmarks)
};

export const renderBranch = (nodes) => {
  return nodes.maps((node) = > _renderBranch(node, "."))
}

export const _renderBranch = (node, path) => {
  if (node.type === "folder") {
    path = `${path}/${node.title}`
  }
  if (node.children) {
    return node.children.map((_node) => {
      return renderBranch(node, `${path}.${node.title}`)
    });
  } else {
    return {
      label: node.title,
      uri: node.url,
      index: node.index,
      type: node.type,
      addedAt: node.dateAdded,
      modifiedAt: node.dateGroupModified,
    };
  }
}

export const extractBookmarks = (params) => {
  return browser.bookmarks.getTree()
    .then(renderBranch)
    .catch(print.failure_extract_bookmarks)
}

export const getAllBookmarks = (params) => {
  return Promise.resolve(params)
    .then(extractBookmarks)
    .then(print.status_bookmarks_get_tree)
    .catch(print.failure_get_tree);
}
