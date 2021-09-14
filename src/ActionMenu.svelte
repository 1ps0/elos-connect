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

async function sendLink(tagName) {
  let params = {
    label: document.title,
    uri: document.URL,
    tag: tagName
  };
  console.log('SAVING', params);
  let result = await _send("api/location/add", params);
  console.log('DONE SAVING', result);
  return result.status;
}

async function sendTag() {
  let newTagButton = document.querySelector('#tag_name');
  console.log("Sending new tag: ", newTagButton.value);
  let tagName = newTagButton.value;
  let result = await _send("api/analysis/tag", ({
    name: tagName
  }));
  if (result.status === 200) {
    renderTag(tagName);
  }
  return result;
}


async function loadTags() {
  let results = await _fetch('api/analysis/tag');
  console.log("[remote][load#tags] ", results);

  // let tabs = await browser.tabs.query({currentWindow: true, active: true});
  // browser.tabs.query({currentWindow: true}, function(tab) {
  // console.log("rendering", tabs[0], results.names);
  for (let tag of results.names) {
    // console.log("[remote][load#tag] ", tag);
    renderTag(tag[1]);
  }
  // });
  // let getAllStored = chrome.storage.local.get(null);
  // chrome.storage.local.set(tagKey);
}

function renderTag(tagName) {
  /* create tag display box */
  let tagContainer = document.querySelector('.panel');
  let tag = document.createElement('li');
  let tagLabel = document.createElement('p');

  tag.setAttribute('class','tag');
  tagLabel.textContent = tagName;

  tag.appendChild(tagLabel);
  tagContainer.appendChild(tag);
  tagLabel.addEventListener('click',async () => {
    if (await sendLink(tagName) === 200) {}
    // TODO flash activation css
  });
  return tag;
}


onMount(async () => {
  console.log('ActionMenu mounted');
  await loadTags();
});
</script>


<section>
  <!-- TODO add collapse for this panel -->
  <p><button id="copy-tabs" on:click={doSelectedCopy}>Copy Selected Tabs</button></p>
  <p><button id="save-pdf" on:click={extractReaderText}>Save Reader PDF</button></p>
  <p><button id="dl-video" on:click={doDownloadVideo}>Download Video</button></p>
  <ul class="panel">
    <li class="new-tag">
      <input id="tag_name" type="text" name="name">
      <button id="tag_submit" class="add">Add</button>
    </li>
  </ul>
</section>

<style>
html, body {
  width: 350px;
}

li {
  margin: 10px;
  display: inline-block;
}

ul {
  border: 1px black;
  padding: 10px;
  margin: 10px;
  display: inline-block;
}

.tag {
  display: block;
}

.panel ul {
}

.panel li {
  display: block;
}

#tag_label {

}

#tag_name {

}

.panel {
  margin: 5px;
}

</style>