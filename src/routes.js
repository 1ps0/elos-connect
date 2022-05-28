export const routeNames = {
    "send_link": "api/location/add",
    "send_tag": "api/analysis/tag",
    "send_extracted_text": "api/analysis/data",
    "sync": "/api/pkg/mine/sync",
    "save_video": "api/action/download/video",
    "save_song": "api/action/download/audio",
    "search": "/api/location/search",
    "db": "api/db/",
};

/*
identifiers
areas = {
    browser: {  },
    tabGroup: { this, here, window, selected, all },
    displayTypes: {
        webAction: { toggle playing, toggle loop, edit playing list, toggle playing list },
        browserAction: {},
        remoteAction: { sync pull, sync push, search remote, }
    },


}
*/
export const _ = null;

import {filterTabsBy} from "./apis.js"

function renderBranch(node, path) {
    if (node.type === "folder") {
        path = `${path}/${node.title}`
    }
    if (node.children.length > 0) {
        return node.children.map((_node) => {
            return renderBranch(node, path)
        });
    } else {
        return {
            label: node.title,
            uri: node.url,
            type: node.type,
            dateAdded: node.dateAdded,
            dateModified: node.dateGroupModified,
            path:
        };
    }
}

export const getAllBookmarks = (params) => {
    return Promise.resolve(params)
        .then(filterTabsBy)
        .then(() => {})
        .then(browser.bookmarks.getTree)
        .then(print.status_bookmarks_get_tree)
        .catch(print.failure_get_tree);
}
