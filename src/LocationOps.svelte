<script>

import { onMount } from 'svelte';
import { _fetch, _send } from "./lib/apis.js"


async function sendLink(tagName) {

  browser.tabs.query({currentWindow: true, active: true}).then(async (tabs) => {
    let params = {
      label: tabs[0].title,
      uri: tabs[0].url,
      tag: tagName
    };
    console.log('SAVING', params);
    let result = await _send("api/location/add", params);
    console.log('DONE SAVING', result);
  }, console.error);
}

async function sendTag() {
  let newTagButton = document.querySelector('#tag_name');
  console.log("Sending new tag: ", newTagButton.value);
  let tagName = newTagButton.value;
  _send("api/analysis/tag", ({
    name: tagName
  })).then(() => {
    renderTag(tagName)
  });
}

async function loadTags() {
  let results = await _fetch('api/analysis/tag');
  console.log("[remote][load#tags] ", results);

  // let tabs = await browser.tabs.query({currentWindow: true, active: true});
  // browser.tabs.query({currentWindow: true}, function(tab) {
  // console.log("rendering", tabs[0], results.names);

  // TODO clear .panel of previous tag entries, for idempotency
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
  console.log('LocationOps mounted');
  await loadTags();
});
</script>

<section>
  <ul class="panel">
    <li class="new-tag">
      <input id="tag_name" type="text" name="name">
      <button class="add" on:click={sendTag}>Add</button>
    </li>
  </ul>
</section>

<style>

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

.panel li {
  display: block;
}

.panel {
  margin: 5px;
}

</style>
