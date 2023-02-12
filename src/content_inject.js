// This file is injected into and runs this code in the browser tab.

import { print } from "./lib/apis/proxy.js";
print.load_elos_connect_content_inject();

// ----- Util

const isElementVisible = (element) => {
  let visible = element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length > 0;
  console.log("testing element visibility:", visible, element);
  return visible;
}




function handleMessage(request, sender, sendResponse) {
  console.log("[CONTENT] Message from the page script:", request, sender, sendResponse);
  if (request.message === "setDarkMode") {
    return Promise.resolve(elementHexMap)
      .then(applyDarkMode)
      .then((response) => ({
        response: response,
        success: true 
      }))
      .then(sendResponse)
      .catch(print.failure_handle_message_set_dark_mode)
  }
  else if (message.action === "readerModeToggled") {
    return Promise.resolve()
      .then(zipImagesAndText)
      .then((zipBuffer) => ({
        success: true,
        data: zipBuffer
      }))
      .then(sendResponse)
      .catch(print.failure_zip_images_and_text)
  }
  else if (request.message === 'playPause') {
    return playPause()
      .then(getPlayingInfo)
      .then(renderPlayingStatus)
      .then(sendResponse)
      .catch(print.failure_handle_message_playpause);

  } else if (request.message === 'toggleLoop') {
    return toggleLoop()
      .then(getPlayingInfo)
      .then(renderPlayingStatus)
      .then(sendResponse)
      .catch(print.failure_handle_message_toggleloop);
  } else if (request.message === 'restart') {
    return restart()
      .then(getPlayingInfo)
      .then(renderPlayingStatus)
      .then(sendResponse)
      .catch(print.failure_handle_message_restart);
  } else if (request.message === 'find') {
    return Promise.resolve(request)
      .then(getContent)
      .then(print.status_find)
      .then((findObj) => {
        return findObj;
      })
      .then(sendResponse)
      .catch(print.failure_handle_message_find);
  } else if (request.message = "extractReaderText") {
    return extractReaderText()
      .then(sendResponse)
      .catch(print.failure_handle_message_extract_reader_text);
  }
}

try {
  print.success_content_inject_js_mounted();
  browser.runtime.onMessage.addListener(handleMessage);
  console.log("content_inject.js finished mounting")
} catch (e) {
  console.log("Caught content_inject.js init error", e);
};
