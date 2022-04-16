<script>

import { onMount } from 'svelte';
import ItemList from "./ItemList.svelte";

import { _fetch,
  _send,
  sendTag,
  sendLink,
  loadTags,
  createNotifySuccess,
  createNotifyFailure,
  print
} from "./lib/apis.js"
import { stores } from "./lib/stores.js";


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
  tagLabel.addEventListener('click', () => {
    return Promise.resolve(tagName)
      .then(sendLink)
      .then((status) => {
        if (status === 200) {
          let bgColor = tag.style.backgroundColor;
          tag.style.backgroundColor = "green";
          setTimeout(() => {
            tag.style.backgroundColor = bgColor;
          }, 500);
        } else if (status >= 400) {
          let bgColor = tag.style.backgroundColor;
          tag.style.backgroundColor = "red";
          setTimeout(() => {
            tag.style.backgroundColor = bgColor;
          }, 500);
        }
      })
      .catch(print.failure)
  });
  return tag;
}

const _sendTag = async (params) => {
    return sendTag(params)
      .then(renderTag)
      .catch(print.failure);
};

onMount(async () => {
  print.success_LocationOps_mounted();

  loadTags()
    .then((tags) => {
      return (tags ? tags : []).forEach((tag) => renderTag(tag))
    })
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
  <ItemList
    readonly=true
    dataStore={stores.contentTag}
  />
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
