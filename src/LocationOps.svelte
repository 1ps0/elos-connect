<script>

import { onMount } from 'svelte';
import { _fetch,
  _send,
  sendTag,
  sendLink,
  loadTags,
  createNotifySuccess,
  createNotifyFailure,
  printFailure
} from "./lib/apis.js"



// let tabs = await browser.tabs.query({currentWindow: true, active: true});
// browser.tabs.query({currentWindow: true}, function(tab) {
// console.log("rendering", tabs[0], results.names);

// TODO clear .panel of previous tag entries, for idempotency
// let getAllStored = chrome.storage.local.get(null);
// chrome.storage.local.set(tagKey);

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

const _sendTag = async (params) => {
    return sendTag(params)
      .then(renderTag)
      .catch(printFailure);
};

onMount(async () => {
  console.log('LocationOps mounted');

  loadTags()
    .then((tags) => tags.forEach((tag) => renderTag(tag)))
    .catch(createNotifyFailure)
});
</script>

<section>
  <ul class="panel">
    <li class="new-tag">
      <input id="tag_name" type="text" name="name">
      <button class="add" on:click={_sendTag}>Add</button>
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
