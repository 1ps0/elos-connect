import { print, notify, register } from "./apis/proxy.js";
import { _send, _fetch } from "./apis/network.js";
import * as tabs from "./apis/tabs.js";

// ------- Send to webpage content_inject.js

export const toContent = (args) => {
  return Promise.resolve(args)
    .then(print.status_send_to_content)
    .then((data) => {
      browser.tabs.sendMessage(data.tabId, data);
      return {
        ...data,
        success: true,
      };
    })
    .then(notify.success)
    .catch(print.failure_send_to_content);
};

export const setDarkMode = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.id, message: "set.darkMode" }))
    .then(toContent)
    .catch(print.failure_send_toggle_loop);
};

export const toggleLoop = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message: "media.toggleLoop" }))
    .then(toContent)
    .catch(print.failure_send_toggle_loop);
};

export const playPause = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message: "media.playPause" }))
    .then(toContent)
    .catch(print.failure_send_play_pause);
};

export const restart = (e) => {
  return Promise.resolve(e)
    .then((data) => ({ tabId: data.tabId, message: "media.restart" }))
    .then(toContent)
    .catch(print.failure_send_restart);
};

// export const sendRuntimeMessage = async (params) => {
//   return browser.runtime.sendMessage(params)
//     .catch(print.failure);
// };

export const sendTabMessage = (args) => {
  return Promise.resolve(args)
    .then((_args) => _args.tabId)
    .then(browser.tabs.sendMessage)
    .catch(print.failure_send_tab_message);
};

export const sendMessageToTabs = (tabs) => {
  return Promise.all(
    tabs.map((tab) => {
      return browser.tabs
        .sendMessage(tab.id, { greeting: "Hi from background script" })
        .then(print.status_send_message_to_tabs_response)
        .catch(print.failure_send_message_to_tabs_response);
    })
  );
};

export const addRuntimeMessageHook = (params) => {
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
};

export const sendRuntimeMessage = async (params) => {
  return Promise.resolve(params)
    .then(pruneMethods)
    .then(browser.runtime.postMessage)
    .catch(print.failure_send_runtime_message);
};

export const toContentScript = async (params) => {
  return Promise.resolve(params)
    .then((_params) => ({
      direction: _params.direction,
      message: _params.message,
    }))
    .then((args) => window.postMessage(args, "*"))
    .catch(print.failure_send_to_content_script);
};

// ------- Send composites

export const openAIApi = (prompt) => {
  const apiKey = "your_openai_api_key_here";
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const model = "gpt-4";

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  });

  const body = JSON.stringify({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const response = fetch(apiUrl, {
    method: "POST",
    headers,
    body,
  });

  const data = response.json();
  return data.choices[0].message.content;
};

export const extractSemanticObjectsAndGroupingsFromDOM = () => {
  const prompt = `Given a browser document, write a JavaScript function that extracts semantic objects and groupings from the DOM. The function should return an object or array containing the extracted information.`;

  try {
    const gpt4Response = callOpenAIAPI(prompt);

    // Create a new function from the GPT-4 response
    const extractedFunction = new Function("document", gpt4Response);

    // Execute the function and return the extracted data
    return extractedFunction(document);
  } catch (error) {
    console.error("Error in extractSemanticObjectsAndGroupingsFromDOM:", error);
  }
};

export const sendTag = (params) => {
  // TODO normalize params interface and validation of values
  return (
    Promise.resolve(params)
      .then((_params) =>
        params && params.tagName ? params.tagName : "#tag_name"
      )
      .then((name) => document.querySelector(name))
      // FIXME extract css styling into module that can be integrated
      .then((button) => button.value)
      .then((tagName) => {
        return {
          uri: "api/analysis/tag",
          args: {
            name: tagName,
          },
        };
      })
      .then(_send)
      .catch(print.failure_send_tag)
  );
};

export const sendLink = async (tagName) => {
  return tabs
    .currentActive()
    .then((tabs) => tabs[0])
    .then((tab) => {
      return {
        uri: "api/location/add",
        body: {
          label: tab.title,
          uri: tab.url,
          tag: tagName,
        },
      };
    })
    .then(_send)
    .then(notify.success)
    .catch(print.failure_send_link);
};

export const sendSidebar = (params) => {
  // params is { tabId: 0, windowId: 0 } only
  // neither gives global table, both gives rejection
  return Promise.resolve(params)
    .then(browser.sidbarAction.open)
    .catch(print.failure_open_sidebar);
};

export const getContexts = (results) => {
  console.log("sending results", results);
  return Promise.resolve(results)
    .then((_results) => {
      return _results.map((result) => {
        return Promise.resolve(result)
          .then((_result) => [result.tabId, { ...result, message: "find" }])
          .then((_result) => browser.tabs.sendMessage(..._result))
          .catch(print.failure_send_message_context);
      });
    })
    .then(Promise.all)
    .catch(print.failure_get_contexts);
};
