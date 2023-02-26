// This file is actionsed into and runs this code in the browser tab.

import * as proxy from "./lib/apis/proxy.js";
import * as actions from "./lib/actions.js";
import * as content from "./lib/content.js";
import * as send from "./lib/send.js";
proxy.print.load_elos_connect_content_actions();

// ----- Util

const isElementVisible = (element) => {
  let visible = element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length > 0;
  console.log("testing element visibility:", visible, element);
  return visible;
}

const handleMediaMessage = (obj) => {
  return Promise.resolve(obj)
    .then(obj => ({ 
      ...obj,
      message: obj.request.message, 
      tabId: obj.sender.tab.id, 
      tab: obj.sender.tab 
    }))
    .then(send.toContent)
    .then(content.getPlayingInfo)
    .then(content.renderPlayingStatus)
    .then(sendResponse)
    .catch(proxy.print.failure_handle_media_message)  
}

const handleMessage = (request, sender, sendResponse) => {
  console.log("[CONTENT] Message from the page script:", request, sender, sendResponse);

  const obj = { request, sender, sendResponse };

  if ('media' in request.message) {
    return handleMediaMessage(obj);

  } else if (request.message === "set.darkMode") {
    return Promise.resolve(actions.elementHexMap) // chesterish
      .then(actions.applyDarkMode)
      .then((response) => ({
        response: response,
        success: true 
      }))
      .then(sendResponse)
      .catch(proxy.print.failure_handle_message_set_dark_mode)

  } else if (message.action === "set.readerMode") {
    return Promise.resolve()
      .then(zipImagesAndText)
      .then((zipBuffer) => ({
        data: zipBuffer,
        success: true,
      }))
      .then(sendResponse)
      .catch(proxy.print.failure_zip_images_and_text);

  } else if (request.message === 'action.find') {
    return Promise.resolve(request)
      .then(content.getTextForRanges)
      .then(proxy.print.status_find)
      .then((findObj) => {
        return findObj;
      })
      .then(sendResponse)
      .catch(proxy.print.failure_handle_message_find);

  } else if (request.message = "action.extractReaderText") {
    return extractReaderText()
      .then(sendResponse)
      .catch(proxy.print.failure_handle_message_extract_reader_text);
  }
}

try {
  proxy.print.success_content_actions_js_mounted();
  browser.runtime.onMessage.addListener(handleMessage);
  console.log("content_actions.js finished mounting")
} catch (e) {
  console.log("Caught content_actions.js init error", e);
};
