
import { print, notify, register } from "./apis/proxy.js";
import { _send, _fetch } from "./network.js";
import { getCurrentActive } from "./apis/tabs.js";

// ------- Send to webpage content_inject.js

export const sendToContent = (params) => {
  return Promise.resolve(params)
    .then(print.status_send_to_content)
    .then((data) => {
      browser.tabs.sendMessage(data.tabId, data);
      return data;
    })
    .then(notify.success)
    .catch(print.failure_send_to_content);
}

export const sendSetDarkMode = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.id, message:'setDarkMode' }))
    .then(sendToContent)
    .catch(print.failure_send_toggle_loop);
}

export const sendToggleLoop = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message:'toggleLoop' }))
    .then(sendToContent)
    .catch(print.failure_send_toggle_loop);
}

export const sendPlayPause = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message:'playPause' }))
    .then(sendToContent)
    .catch(print.failure_send_play_pause);
};

export const sendRestart = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message:'restart' }))
    .then(sendToContent)
    .catch(print.failure_send_restart);
};

// export const sendRuntimeMessage = async (params) => {
//   return browser.runtime.sendMessage(params)
//     .catch(print.failure);
// };

export const sendTabMessage = (args) => {
  return Promise.resolve(args) 
    .then(_args => _args.tabId)
    .then(browser.tabs.sendMessage)
    .catch(print.failure_send_tab_message);
};

export const sendMessageToTabs = async (tabs) => {
  return Promise.all(tabs.map((tab) => {
    return browser.tabs.sendMessage(
      tab.id,
      {greeting: "Hi from background script"}
    )
    .then(print.status_send_message_to_tabs_response)
    .catch(print.failure_send_message_to_tabs_response)
  }))
}

export const addRuntimeMessageHook = async (params) => {
  return browser.runtime.onMessage.addListener(params.hook);
};


// attempt to fix the DataCloneError error,
// where sendMessage of some kind includes
// methods in an object, so they need to be pruned
export const pruneMethods = (value) => {
  return Promise.resolve(value)
    .then(JSON.stringify)
    .then(JSON.parse)
    .catch(proxy.print.failure_stores_prune_methods);
}

export const sendRuntimeMessage = async (params) => {
  return Promise.resolve(params)
    .then(pruneMethods)
    .then(browser.runtime.postMessage)
    .catch(print.failure_send_runtime_message);
};

export const sendToContentScript = async (params) => {
  return Promise.resolve(params)
    .then((_params) => ({
      direction: _params.direction,
      message: _params.message
    }))
    .then((args) => window.postMessage(args, "*"))
    .catch(print.failure_send_to_content_script);
}


// ------- Send composites

export const sendTag = (params) => {
  // TODO normalize params interface and validation of values
  return Promise.resolve(params)
    .then(_params => params && params.tagName ? params.tagName : '#tag_name')
    .then((name) => document.querySelector(name))
    // FIXME extract css styling into module that can be integrated
    .then((button) => button.value)
    .then((tagName) => {
      return {
        uri: "api/analysis/tag",
        args: {
          name: tagName
        }
      }
    })
    .then(_send)
    .catch(print.failure_send_tag)
}

export const sendLink = async (tagName) => {
  return getCurrentActive()
    .then(tabs => tabs[0])
    .then((tab) => {
      return {
        uri: "api/location/add",
        body: {
          label: tab.title,
          uri: tab.url,
          tag: tagName
        }
      }
    })
    .then(_send)
    .then(notify.success)
    .catch(print.failure_send_link)
  }


export const sendSidebar = (params) => {
  // params is { tabId: 0, windowId: 0 } only
  // neither gives global table, both gives rejection
  return Promise.resolve(params)
    .then(browser.sidbarAction.open)
    .catch(print.failure_open_sidebar);
}

export const getContexts = (results) => {
  console.log("sending results", results);
  return Promise.resolve(results)
    .then((_results) => {
      return _results.map((result) => {
        return Promise.resolve(result)
          .then(_result => [result.tabId, {...result, message: "find"}])
          .then(_result => browser.tabs.sendMessage(..._result))
          .catch(print.failure_send_message_context)
      })
    })
    .then(Promise.all)
    .catch(print.failure_get_contexts);
}