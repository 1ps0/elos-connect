<script>
import { onMount } from 'svelte';

import {
  _fetch,
  _send,
  getCurrentActiveTab,
  doSelectedCopy,
  doDownloadVideo,
  createNotifySuccess
} from "./lib/apis.js"
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



let items = [
  {
    title: 'Copy Selected Tabs',
    click: doSelectedCopy
  },
  {
    title: 'Download Video',
    click: doDownloadVideo
  },
  // {
  //   title: '',
  //   click: ''
  // },
]
onMount(async () => {
  console.log('ActionMenu mounted');
});
</script>


<section>

  <!-- <p><button id="save-pdf" on:click={extractReaderText}>Save Reader PDF</button></p> -->
  {#each items as item (item.title)}
    <p><button on:click={item.click}>{item.title}</button></p>
  {/each}

  <div class="panel-section-separator"></div>
  <div class="panel-section panel-section-header">
    <div class="text-section-header">Window manipulator</div>
  </div>

</section>

<style>
</style>