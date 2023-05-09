import * as proxy from "./proxy.js";
import * as windows from "./windows.js";

export const create = (tabs) => {
  return Promise.all(
    tabs.map((tab) => {
      return Promise.resolve(tab)
        .then((_tab) => ({
          parentId: "monitoring",
          title: tab.title,
          url: tab.url,
        }))
        .then(browser.bookmarks.create)
        .catch(proxy.print.failure_create_tab_bookmark);
    })
  );
};

export const update = (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    return Promise.resolve(tab)
      .then((_tab) => ({ url: tab.url, title: tab.title }))
      .then((_meta) => browser.bookmarks.update("", _meta))
      .catch(proxy.print.failure_update_monitoring_bookmark);
  }
};

export const createMonitoringBookmarks = (tab) => {
  return Promise.resolve(tab)
    .then((_tab) => ({
      parentId: "monitoring", // FIXME make arg?
      title: tab.title,
      url: tab.url,
      windowId: tab.windowId,
    }))
    .then(browser.bookmarks.create)
    .catch(proxy.print.failure_create_monitoring_bookmarks);
};

export const removeBookmarksOnTabRemoval = (tabId) => {
  browser.bookmarks.remove(tabId);
};

// Promise.resolve("monitoring")
//     .then(windows.getTabsByWindowValue)
//     .then(create)
//     .then(() => {
//         browser.tabs.onUpdated.addListener(update);
//         browser.tabs.onCreated.addListener(createBookmarksOnTabCreation);
//         browser.tabs.onRemoved.addListener(removeBookmarksOnTabRemoval);
//     })
//     .catch(proxy.print.failure_remove_bookmarks_on_tab_removal);

// --------

export const sendBookmarks = () => {
  return Promise.resolve(args).catch(proxy.print.failure_send_bookmarks);
};

export const addBookmarkFromTab = (args) => {};

export const add = (args) => {
  return (
    Promise.resolve(args)
      // .then((_args) => {

      // })
      .then((_args) => ({
        tags: _args.tags,
        title: args.title,
      }))
      .then(browser.bookmarks.create)
      .catch(proxy.print.failure_send_bookmarks)
  );
};

export const renderBranch = (nodes) => {
  return nodes.map((node) => _renderBranch(node, "."));
};

export const _renderBranch = (node, _path) => {
  console.log("rendering node -> ", _path, node);
  if (node.type === "folder") {
    _path = `${_path}/${node.title}`;
  }
  if (node.children) {
    return node.children.map((_node) => {
      return _renderBranch(node, `${_path}.${node.title}`);
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
};

export const renderNode = (_path, node) => {
  return {
    path: _path,
    label: node.title,
    uri: node.url,
    index: node.index,
    type: node.type,
    addedAt: node.dateAdded,
    modifiedAt: node.dateGroupModified,
  };
};

const materializeLeafNodes = (node) => {
  let nodes = [];
  let queue = {};
  while (queue.length > 0) {
    // node =
  }
  return nodes;
};

const recurseNodes = (node, path) => {
  let _children = node.children;
  if (!_children) return [renderNode(path, node)];

  let nodes = [];
  for (let x = 0; x < _children.length; x++) {
    let _node = _children[x];
    let _path = `${path}/${_node.title}`;
    nodes = nodes.concat(recurseNodes(_node, _path));
  }
  return nodes;
};

export const extract = (args) => {
  return browser.bookmarks
    .getTree()
    .then((node) => recurseNodes(node[0], "."))
    .catch(proxy.print.failure_extract_bookmarks);
};

export const getAll = (args) => {
  return Promise.resolve(args)
    .then(extract)
    .then(proxy.print.status_bookmarks_get_tree)
    .catch(proxy.print.failure_get_tree);
};

export const search = (args) => {};

export const bookmarkApi = (() => {
  if (typeof browser !== "undefined" && browser.bookmarks) {
    return browser.bookmarks;
  } else if (typeof chrome !== "undefined" && chrome.bookmarks) {
    return chrome.bookmarks;
  } else {
    throw new Error("Bookmark API not supported");
  }
})();

export const apis = {
  bookmarks: bookmarkApi,
};

function setBookmarkAnnotation(id, annotation) {
  return Promise.resolve([id, annotation])
    .then(([id, annotation]) =>
      apis.bookmarks.update(id, { meta: { annotation } })
    )
    .catch(proxy.print.failure);
}

function getBookmarkAnnotations(id) {
  const fallbackAnnotations = [];

  return Promise.resolve(id)
    .then((id) => apis.bookmarks.get(id))
    .then((nodes) => nodes[0]?.meta?.annotations ?? fallbackAnnotations)
    .catch(proxy.print.failure);
}

// // Example usage:
// setBookmarkAnnotation("bookmark-id-1", "My annotation")
//   .then(() => getBookmarkAnnotations("bookmark-id-1"))
//   .then((annotations) => console.log(annotations))
//   .catch(proxy.print.failure_bookmark_annotation_set);

export const fetchById = (job) => {
  return browser.bookmarks
    .get(job.id)
    .then((bookmarks) => {
      if (!Array.isArray(bookmarks) || bookmarks.length < 1) {
        throw new Error(`Bookmark with ID ${job.id} not found`);
      }
      return bookmarks[0];
    })
    .catch(proxy.print.failure_fetch_bookmark_by_id);
};

export const fetchAnnotations = (bookmark) => {
  return browser.bookmarks
    .getAnnotation(bookmark.id, META_ANNOTATION_KEY)
    .then((value) => {
      if (!value) {
        throw new Error(
          `Meta annotation for bookmark ${bookmark.id} not found`
        );
      }
      return value;
    })
    .catch(proxy.print.failure_fetch_annotations);
};

export const importFromStash = (args) => {
  return browser.storage.local
    .get("stash")
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
    .catch(proxy.print.failure_import_from_stash);
};

// ---

export const createBookmarkForTag = (_tag) => {
  return Promise.resolve()
    .then(() => {
      return browser.bookmarks.search({ title: "example" });
    })
    .then((bookmarks) => {
      return browser.bookmarks.update(bookmarks[0].id, {
        title: "example",
        tags: ["example-tag"],
      });
    })
    .catch(proxy.print.failure_import_from_stash);
};

export const createBookmarkForResearchNote = (_type) => {
  return Promise.resolve({
    title: "example research",
    url: "https://example.com",
    parentId: "research_folder",
    index: 0,
    // Add a custom property to store research notes
    research_notes:
      "# Research Notes\n1. **Source**: [Example Article](https://example.com)\n2. **Key Takeaways**:\n- Point 1\n- Point 2\n3. **Comments**:\n- Example comment 1\n- Example comment 2",
  })
    .then(browser.bookmarks.create)
    .catch(proxy.print.failure_import_from_stash);
};
