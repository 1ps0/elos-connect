<script>
import { onMount } from 'svelte';

import {
  _fetch,
  _send,
  getCurrentActiveTab,
  sendToContent,
  doSelectedCopy,
  doDownloadVideo,
  doReloadSystem,
  notify,
  print
} from "./lib/apis.js"

// let savePDFButton = document.querySelector('#save-pdf');
// let courseDataElement = document.querySelector('#active-course-data');

let enabledCourseSites = [
  "coursera.org",
  "edx.org",
  "udemy.com",
  "khanacademy.org"
];


const extractReaderText = (e) => {
  // browser.runtime.onMessage.addListener(registerScript);
  return getCurrentActiveTab()
    .then((tabs) => {
      return tabs.filter((tab) => tab.isArticle)[0];
    })
    .then((tab) => {
        !tab.isInReaderMode ? browser.tabs.toggleReaderMode() : false;
        return tab.id;
    })
    .then((tabId) => ({
      tabId: tabId,
      message:'extractReaderText'
    }))
    .then(sendToContent)
    .then(print.status_content_response_reader_text)
    .then((pageData) => ({
      uri: "api/analysis/data",
      body: pageData,
    }))
    .then(_send)
    .catch(print.failure_extract_reader_text);
}



let items = [
  {
    title: 'Extract Text',
    click: extractReaderText,
  },
  {
    title: 'Reload eLOS',
    click: doReloadSystem
  },
  {
    title: 'Copy Selected Tabs',
    click: doSelectedCopy
  },
  {
    title: 'Download Video',
    click: doDownloadVideo
  },
]
onMount(async () => {
  print.success_ActionMenu_mounted();
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