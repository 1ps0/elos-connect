<script>
import { onMount } from 'svelte';

import { _fetch, _send } from "./lib/apis.js"
import { renderJSON } from "./lib/render.js";

// let savePDFButton = document.querySelector('#save-pdf');
// let courseDataElement = document.querySelector('#active-course-data');

function readerSelectors() {
  let contentData = document.querySelectorAll('.page')
  return {
    // body: document.querySelector('.container'),
    title: document.querySelector('.reader-title h1').value,
    link: document.querySelector('.reader-domain a').href,
    readerTime: document.querySelector('.reader-estimated-time').value,
    contentBody: contentData
  };
}


async function addMetric() {
  let elements = document.getElementById('metrics').elements;
  let entry = elements.map((x) => {

  });
  await _send("api/db/files", ({
    table_name: 'metric',
  }));
}


let enabledCourseSites = [
  "coursera.org",
  "edx.org",
  "udemy.com",
  "khanacademy.org"
];

let registered = null;
async function registerScript(message) {
  let hosts = message.hosts;
  let code = message.code;

  if (registered) {
    registered.unregister();
  }

  registered = await browser.contentScripts.register({
    matches: hosts,
    js: [{code}],
    runAt: "document_idle"
  });

}

async function extractReaderText(e) {
  browser.runtime.onMessage.addListener(registerScript);
  // let tabs = await browser.tabs.query({
  //   currentWindow: true,
  //   active: true
  // });
  let pageData = renderJSON(document);
  console.log('doing reader text:', pageData);
  if (tabs.isArticle && !tabs.isInReaderMode) {
    await browser.tabs.toggleReaderMode();
    // await browser.tabs.saveAsPDF({}); // toFileName
    await _send("api/analysis/data", renderJSON());
    await browser.tabs.toggleReaderMode();
  } else {
    // await browser.tabs.toggleReaderMode();
    await browser.tabs.saveAsPDF({}); // toFileName
    // await browser.tabs.toggleReaderMode();
  }
}

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(function() {
    console.log("copied succesfully: "+newClip);
    /* clipboard successfully set */
  }, function() {
    console.log("failed to copy "+newClip);
    /* clipboard write failed */
  })
}

async function doDownloadVideo(e) {
  let _window = await browser.windows.getCurrent();
  let tab = await browser.tabs.query({
    active: true,
    windowId: _window.id
  });
  let result = await _send("api/action/download/video", {
    uri: tab[0].url,
  });
  console.log("FINISHED", result);
};

async function doSelectedCopy(e) {
  let tabs = await browser.tabs.query({
    highlighted: true,
    // active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT
  });
  console.log('doing selected copy:', browser.windows.WINDOW_ID_CURRENT, tabs);
  updateClipboard( tabs.map((x) => x.title+","+x.url).join('\n'));
}


// "window_update_move_topright"
const window_update_move_topright = () => {
  browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
    left: 0,
    top: 0
  });
};

// "window-update-size_768"
const window_update_size_768 = () => {
  browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
    width: 768,
    height: 1024
  });
}

// "window-update-minimize"
const window_update = () => {
  browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
    state: "minimized",
  });
}

// "window-create-detached-panel"
const window_create = () => {
  browser.windows.create({
    // type: "popup",
    type: "detached_panel",
    incognito: true,
  }).then(() => {
    console.log("The detached panel has been created");
  });
}

// "window-remove"
const window_stash = () => {
  // browser.windows.getAll()
  browser.tabs.query({
    highlighted: true,
    // active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT
  }).then((tabs) => {
    console.log('doing selected copy:', windows.WINDOW_ID_CURRENT, tabs);
    return tabs.map((x) => x.title+","+x.url).join('\n');
  }).then(() => {
    browser.windows.remove(windows.WINDOW_ID_CURRENT);
  });
}

// "window-resize-all"
const window_resize_all = () => {
  browser.windows.getAll().then((windows) => {
    for (var item of windows) {
      browser.windows.update(item.id, {
        width: 1024,
        height: 768
      });
    }
  });
}

// "window-preface-title"
const window_preface_title = () => {
  browser.windows.update(browser.windows.WINDOW_ID_CURRENT, {
    titlePreface: "Preface | "
  });
};


onMount(async () => {
  console.log('ActionMenu mounted');
});
</script>


<section>
  <div class="panel-section panel-section-header">
    <div class="text-section-header">Window manipulator</div>
  </div>

  <a href="#" on:click|preventDefault={window_update_move_topright}>Move Top Right</a><br>
  <a href="#" on:click|preventDefault={window_update_size_768}>Resize window to 768x1024</a><br>
  <!-- <a href="#" id="window-resize-all">Resize all windows to 1024x768</a><br> -->
  <!-- <a href="#" id="window-update-minimize">Minimize</a><br>

  <div class="panel-section-separator"></div>

  <a href="#" id="window-preface-title">Preface title</a><br>

  <div class="panel-section-separator"></div>

  <a href="#" id="window-create-incognito">Create new incognito window</a><br>
  <a href="#" id="window-create-normal">Create normal window</a><br>
  <a href="#" id="window-create-panel">Create panel</a><br>
  <a href="#" id="window-create-detached-panel">Create detached panel</a><br>
  <a href="#" id="window-create-popup">Create popup</a><br> -->
  <!-- TODO add collapse for this panel -->
  <p><button id="copy-tabs" on:click={doSelectedCopy}>Copy Selected Tabs</button></p>
  <p><button id="save-pdf" on:click={extractReaderText}>Save Reader PDF</button></p>
  <p><button id="dl-video" on:click={doDownloadVideo}>Download Video</button></p>
</section>

<style>


a {
  margin: 10px;
  display: inline-block;
}

.panel {
  margin: 5px;
}

</style>