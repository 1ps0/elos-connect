
import { print, notify, register } from "./apis/proxy.js";
import { _send, _fetch } from "./network.js";
import { getAllTabs } from "./tabs.js";
import { getContexts } from "./send.js"

// -------- Find composites

export const findInTab = (query, tabId) => {
  return Promise.resolve([query, tabId])
    .then(args => [
      args[0].join(' '), 
      {
        tabId: args[1],
        includeRangeData: true,
        includeRectData: true,
      }
    ]) 
    // TODO set timeout to filter slow promises. currently none
    .then(args => browser.find.find(...args))
    .then((results) => ({
      tabId: tabId,
      count: results.count,
      rangeData: results.rangeData
    }))
    .catch(print.failure_find_in_tab)
    .finally((result) => {
      return {
        count: 0, // overwritten by result if not failcase
        ...result,
        tabId: tabId
      }
    })
}

export const findInAll = async (params) => {
  // TODO add soft 'limit' on 'all tabs' count.
  return getAllTabs(params)
    .then((_params) => {
      return Promise.all(_params.map((tab) => {
        return findInTab(params, tab.id);
      }))
    })
    .then((_params) => {
      return _params.filter((result) => (result && result.count > 0));
    })
    // .then(print.status)
    .then(getContexts)
    .then((results) => {
      return results.map(async (result) => {
        return {
          content: ` -- ${params}`, //${result.text.slice(0,10)}
          description: await result.then(print.success).catch(print.failure),
        }
      });
    })
    .catch(print.failure_find_in_all);
}
