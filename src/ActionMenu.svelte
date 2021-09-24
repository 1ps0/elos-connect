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
  });
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
  let _window = await browser.windows.getCurrent();
  let tabs = await browser.tabs.query({
    highlighted: true,
    // active: true,
    windowId: _window.id
  });
  console.log('doing selected copy:', _window, tabs);
  updateClipboard( tabs.map((x) => x.title+","+x.url).join('\n'));
}




onMount(async () => {
  console.log('ActionMenu mounted');
});
</script>


<section>
  <!-- TODO add collapse for this panel -->
  <p><button id="copy-tabs" on:click={doSelectedCopy}>Copy Selected Tabs</button></p>
  <p><button id="save-pdf" on:click={extractReaderText}>Save Reader PDF</button></p>
  <p><button id="dl-video" on:click={doDownloadVideo}>Download Video</button></p>
</section>

<style>
</style>