<script>
/*
DESIGN

current 'focus' workspace: (card form)
- name of session / anchor words
- scratch for notes
- stash for links
- progress for link content
- todo items
- timers and history
-

*/

import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

import {
  updatePlaying,
  getCurrentActiveTab,
  getAllTabs,
  bringToFront,
  notify,
  print
} from "./lib/apis.js";
import ItemList from "./ItemList.svelte";

let focusStore = writable({});

const activeTab = {};

const updateStoreFromTabs = (store) => {
  return getAllTabs()
    .then((tabs) => {
      return tabs.map((tab) => ({
        title: tab.title,
        tabId: tab.id,
        windowId: tab.windowId,
        isArticle: tab.isArticle,
        url: tab.url,
        timestamp: Date.now()
      }));
    })
    .then((tabs) => store.update((n) => tabs));
}

let groupMode = "window";
$: {
  switch(groupMode) {
    case "tab":
      updateStoreFromTabs(focusStore)
        .catch(print.failure_focus_groupmode_tab);
      break;
    case "window":
      updateStoreFromTabs(focusStore)
        .catch(print.failure_focus_groupmode_window);
      break;
    case "tag":
      break;
  }
}
const buttonProps = [
  {
    name: 'show',
    description: '',
    icon: () => 'Show',
    action: bringToFront
  },
];
onMount(async () => {
  print.success_Focus_mounted();
  // groupMode = "window";
  /*
    autotag. a note in the toolbar that auto generates based on content being viewed.
    context based panels which show content based

    list active tabs by window. click to goto
    list tabs in current window.
    list actions available.
    pin tabs.

    pause all players
    resume all players
    toggle player
    add to named group
    read article in readermode
  */

  // const tabUpdate = (activeInfo, other) => {
  //   console.log("[UPDATING][TAB INFO]", activeInfo, other, activeTab);
  //   activeTab.previousTabId = activeInfo.previousTabId;
  //   activeTab.tabId = activeInfo.tabId;
  //   activeTab.windowId = activeInfo.windowId;
  // };
  // browser.tabs.onActivated.addListener(tabUpdate);
  // browser.tabs.onUpdated.addListener(tabUpdate);
  /*
  1 show current page
  2
  */
  // {
  //   title: '',
  //   loadingMsg: '',
  //   expectsArray: false,
  //   titleKey: '',
  //   catchMsg: '',
  // }
});

const handleClicked = (_item) => {

};


const playersStore = writable({});

</script>

<section>
  <p>Played (state capture demo)</p>
  <ItemList
    readonly=true
    dataStore={playersStore}
    titleKey="title"
    on:didClick={bringToFront}
  />
</section>

<section>
  <p>Group By (reordering demo)</p>
  <ul>
    <li on:click={()=>{groupMode='tag'}}>Tag</li>
    <li on:click={()=>{groupMode='window'}}>Window</li>
    <li on:click={()=>{groupMode='tab'}}>Tab</li>
  </ul>
  <ItemList
    readonly=true
    dataStore={focusStore}
    titleKey="title"
    on:didClick={bringToFront}
  />
</section>
<section>
  <ul>
    <li>
      <title>Active Page (update demo)</title>
      <p>
        {#await getCurrentActiveTab()}
          Loading current Active Tab
        {:then tabs}
          {#each tabs as tab}
            {tab.title} - {console.log("ACTIVE TAB", tab)}
          {/each}
        {:catch err}
          ERROR: {err.message}
        {/await}
      </p>
    </li>
  </ul>
</section>

<style>

</style>
