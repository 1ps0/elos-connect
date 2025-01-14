// This file is actionsed into and runs this code in the browser tab.

import * as proxy from './lib/apis/proxy.js';
import * as content from './lib/content.js';
import * as send from './lib/send.js';
import * as recorder from './video_capture.js';

proxy.print.load_elos_connect_content_actions();

// ----- Util

const isElementVisible = (element) => {
  let visible =
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length > 0;
  console.log('testing element visibility:', visible, element);
  return visible;
};

const handleElementMessage = (obj, sendResponse) => {
  return Promise.resolve(obj)
    .then(content.applyToControlElements)
    .catch(proxy.print.failure_handle_element_message);
};

const handleMediaMessage = (obj, sendResponse) => {
  return Promise.resolve(obj)
    .then((obj) => ({
      ...obj,
      message: obj.request.message,
      tabId: obj.sender.tab.id,
      tab: obj.sender.tab,
    }))
    .then(send.toContent)
    .then(content.getPlayingInfo)
    .then(content.renderPlayingStatus)
    .then(sendResponse)
    .catch(proxy.print.failure_content_handle_media_message);
};

let recording = null;
const handleMessage = (request, sender, sendResponse) => {
  console.log(
    '[CONTENT] Message from the page script:',
    request,
    sender,
    sendResponse
  );

  const obj = { request, sender, sendResponse };

  if (request.message.indexOf('media') != -1) {
    return handleMediaMessage(obj, sendResponse);
  } else if (request.message.indexOf('element') != -1) {
    return handleElementMessage(obj, sendResponse);
  } else if (request.message === 'set.darkMode') {
    return Promise.resolve(content.elementHexMap) // chesterish
      .then(content.applyDarkMode)
      .then((response) => ({
        response: response,
        success: true,
      }))
      .then(sendResponse)
      .catch(proxy.print.failure_handle_message_set_dark_mode);
  } else if (request.message === 'capture.video-clip') {
    return Promise.resolve(request.message)
      .then(_msg => {
        let video = document.querySelector('video');
        recording = recorder.captureVideoClip(video);
      })
      .then(() => sendResponse({success: true}))
      .catch(proxy.print.failure_capture_video);
  } else if (request.message === 'set.readerMode') {
    return Promise.resolve()
      .then(zipImagesAndText)
      .then((zipBuffer) => ({
        data: zipBuffer,
        success: true,
      }))
      .then(sendResponse)
      .catch(proxy.print.failure_zip_images_and_text);
  } else if (request.message === 'content.find') {
    return Promise.resolve(request)
      .then(content.getTextForRanges)
      .then(proxy.print.status_find)
      .then((findObj) => {
        return findObj;
      })
      .then(sendResponse)
      .catch(proxy.print.failure_handle_message_find);
  } else if ((request.message = 'content.extractReaderText')) {
    return content
      .extractReaderText()
      .then(sendResponse)
      .catch(proxy.print.failure_handle_message_extract_reader_text);
  }
};

try {
  proxy.print.success_content_actions_js_mounted();
  browser.runtime.onMessage.addListener(handleMessage);
  // Promise.resolve(content)
  //   .then(_content => _content.elementHexMap) // chesterish
  //   .then(content.applyDarkMode)
  //   .then((response) => ({
  //     response: response,
  //     success: true,
  //   }))
  //   .then(sendResponse)
  //   .catch(proxy.print.failure_handle_message_set_dark_mode);
  console.log('content_actions.js finished mounting');
} catch (e) {
  console.log('Caught content_actions.js init error', e);
}
