<script>

import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

import {
  notify,
  print,
} from "./lib/apis.js";
import ItemList from "./ItemList.svelte";

const states = ['open', 'history'];
const groups = {};

const tab_template = {
  id: -1,
  windowId: -1,
  title: "",
  url: ""
}

const group_template = {
  state: 'history',
  tabs: []
};

const tabStore = writable([]); // local to this panel/page only


const historyDaemon = (node, parameters) => {
  return {

    update(parameters) {},
    destroy() {}
  }
}

const captureCurrent = async () => {
  return getAllTabs()
    .then((tabs) => {
      let result = {
        tabs: tabs.reduce((prev, tab) => {
          prev[tab.id] = tab;
          return prev;
        }, {}),
        windows: {}
      };
      for (let tab of tabs) {
        if (!result.windows[tab.windowId]) {
          result.windows[tab.windowId] = {}
        }
        result.windows[tab.windowId][tab.id] = tab;
      }

    })
    .then(print.success_capture_current)
    .catch(print.failure_capture_current);

}


const captureSession = async (sessionId) => {

}

/*
stash
  select:
    current
    window
  as:
    taglist

capture
  type:
    video
    audio
  as:
    pip
    save
*/



onMount(async () => {
  print.success_WebHistory_mounted();

  // browser.sessions.restore(
  //   sessionId             // string
  // )

  browser.sessions.getRecentlyClosed({
    // maxResults: sessions.MAX_SESSION_RESULTS // 25
  })
    .then(() => {})
    .catch(print.failure);

});

</script>

<section>
  <ItemList
    readonly=true
    dataStore={tabStore}
    titleKey="title"
  />
</section>

<style>

.player {
  border:  1px;
  padding:  0;
  margin:  0;
}

</style>
