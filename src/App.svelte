<script>
/*
TODO - desktop
- set background color/image/video/panel
- smiley face when no panels open
- hover over smiley face shows "close" button below it
- right-click capture needs to have an option to show browser right-click menu (probably via capture-event suppression)

TODO - layout
- panels with pin/close buttons, probably a desktop bar
- panel with options to arrange panels
- panel with native os functions, like open finder, run command, etc.
- join panels, split panels
- toolbar can be glommed on to all sides of a component frame

*/

import { onMount } from 'svelte';

import { icons } from "./lib/icons.js";
import { components } from "./components.js";
import { panelTypes, optionTypes, layoutConfig } from "./config/panels.js";
console.log("PANEL TYPES", panelTypes);

import { _fetch, updateFiletype, openFile, linkList } from "./lib/apis.js";
import { stores } from "./lib/stores.js"

import LayoutGrid from "./LayoutGrid.svelte";
import { _layoutAction } from "./lib/layoutAction.js";
import layoutGridHelp from "./lib/layout_grid/helper.js";
import layoutItem from "./lib/layout_grid/item.js";

const genId = () => "_" + Math.random().toString(36).substr(2, 9);
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
const serializeLayout = (val) => { return JSON.stringify({...val, key: 'layout'}) };


let items = [];
let objects = {};
$: items;
// $: console.log("ITEMS", items);

function hydrateParams(item) {
  if (!components.hasOwnProperty(item.componentName)) {
    console.log("MISSING COMPONENT", item.componentName);
  }

  // hydrate datastores
  if (item.props !== undefined
      && item.props.dataStore !== undefined
      && item.props.dataStore) {

    item.props.dataStore = stores[item.props.dataStore];

    if (item.target in objects && objects[item.target]) {
      objects[item.target].$set("dataStore", item.props.dataStore);
    }
  }

  // hydrate events
  if (item.event !== undefined) {
    switch(item.event.callback) {
      case "updateFiletype": item.event.callback = updateFiletype; break;
      case "togglePanel": item.event.callback = togglePanel; break;
      case "openFile": item.event.callback = openFile; break;
    }
    if (item && item.target && item.target in objects && objects[item.target] !== null) {
      objects[item.target].$on(item.event.name, item.event.callback);
    }
  }
  return item;
}

function positionItem(item) {
  return {
    ...item,
    ...layoutGridHelp.findSpace(item, items, layoutConfig.columnCount)
  };
}

function _newItem(options={}) {
  return positionItem(
    layoutGridHelp.item({
      w: layoutConfig.columnCount,
      h: 7, // FIXME add default height
      id: genId(),
      ...hydrateParams(options),
    })
  );
}

function add(panelTarget, options={}) {
  // TODO render icons into menuItems
  // TODO render source/dataStore props into actual stores
  if (!panelTypes.hasOwnProperty(panelTarget)) {
    console.log("MISSING PANEL", panelTarget);
  }

  options = {...panelTypes[panelTarget], ...options};
  let rootItem = _newItem(options);
  items = [...items, rootItem];
  console.log('ADDING', panelTarget, rootItem);

  return true;
};


const onAdd = (val) => {
  console.log("did onAdd", val);
  let item = val.detail;

  if (item && item.event && item.target in objects) {
    objects[item.target].$on(item.event.name, item.event.callback);
  }
};

const remove = (item) => {
  // FIXME move object to stasis BEFORE deleting it
  items = items.filter((value) => value.target !== item);
  if (items.length > 0) {
    delete objects[item];
  }
};

function togglePanel(e) {
  _togglePanel(e.detail.name);
}

function _togglePanel(itemName) {
  let _layout = items.filter((value) => value.target === itemName);
  if (_layout.length > 0)
    remove(itemName);
  else
    add(itemName);
};


function parseComponents(text) {
  let params = {};
  text.split(' ').forEach(part => {
    var param = part.split(":");
    if (param.length > 1) {
      params[param[0]] = param[1]
    }
  });
  return params;
}
function createSuggestionsFromResponse(response) {
  return new Promise(resolve => {
    console.log(response);
    let suggestions = [];
    let suggestionsOnEmptyResults = [{
      content: "about:blank",
      description: "no results found"
    }];
    if (!response || !response.status || !response.results) {
      return resolve(suggestionsOnEmptyResults);
    }

    response.results.forEach( obj => {
      suggestions.push({
        content: obj.uri,
        description: '['+obj.value+'] '+obj.label,
      });
    });
    console.log('suggestions',suggestions);
    return resolve(suggestions);
  });
}

function getTree(node) {
    var r = {tag: node.nodeName}, a, i;
    if (node.childElementCount) {
        r.children = [];
        for (i = 0; a = node.children[i]; i++) {
            r.children.push(getTree(a));
        }
    }
    for (i = 0; a = node.attributes[i]; i++) {
        r[a.nodeName] = a.nodeValue;
    }
    return r;
}

// var links = document.querySelectorAll('a');
// console.log(getTree(links[0])); // only pass the first node to the function

function htmlToJson(div){
 var tag = {}
 tag['tagName'] = div.tagName
 tag['children'] = []
 for(var i = 0; i < div.children.length; i++){
    tag['children'].push(htmlToJson(div.children[i]));
 }
 for(var i = 0; i < div.attributes.length;i++) {
    var attr = div.attributes[i];
    tag['_'+attr.name] = attr.value;
 }
 return tag;
}

function resolve(path, obj=self, separator='.') {
    var properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce((prev, curr) => prev && prev[curr], obj)
}

onMount(async () => {
  console.log('App mounted');

  add("panel-mainmenu");
  add("panel-actionmenu");
  // add("panel-locations");
  // add("panel-commandbar");

  browser.omnibox.setDefaultSuggestion({
    description: `Search eLOS location database: \
      search [tag | title | url]: <value:str>)`
  });

  browser.omnibox.onInputChanged.addListener(async (text, addSuggestions) => {
    console.log("parsing", text);
    let params = parseComponents(text);
    console.log("SHOW SUGGESTIONS", params);
    let data = null;
    if (params.length === 0) {
      data = [];
    } else {
      data = await _fetch("/api/location/search", params);
    }
    // stores.links.subscribe((e) => {});
    addSuggestions(await createSuggestionsFromResponse(data));
  });

  browser.omnibox.onInputEntered.addListener((url, disposition) => {
    console.log("INPUT SUBMITTED", url, disposition);
    let parts = url.split(':')
    if (parts[0].indexOf('file') > -1) {
      //
    }
    switch (disposition) {
      case "currentTab":
        browser.tabs.update({url});
        break;
      case "newForegroundTab":
        browser.tabs.create({url});
        break;
      case "newBackgroundTab":
        browser.tabs.create({url, active: false});
        break;
    }
    // linkList(params)
    // if ("search" in parts) {
    //   let _cmds = cmds.search;
    //   console.log('SEARCHING', parts, _cmds);
    //   for (part in parts) {
    //     if (part in Object.keys(_cmds)) {
    //       if ()

    //     }
    //   }

    // }
  });

});

//bind:items={items}
</script>

<main>

  <section>
    <LayoutGrid
      cols={layoutConfig.columnCount}
      gap={layoutConfig.panelGap}
      rowHeight={layoutConfig.rowHeight}
      bind:items
      let:item
      let:index
    >
      <svelte:component
        id={item.target}
        this={components[item.componentName]}
        bind:this={objects[item.target]}
        on:didMount={onAdd}
        data={item}
        {...item.props}
        {index}
      />
    </LayoutGrid>
  </section>

</main>

<style>


body {
  margin: 0;
}

main {
  margin: 0 0 0 0;
  /*background-color: blue;*/
  font-size: 16px; /* Increased text to enable scrolling */
  padding: 0px 2px;
}

section > div {
  display: block;
  /*position: absolute;*/
  overflow: auto;
  /*top: 50%;
  left: 50%;*/
  min-height: 100%;
  min-width: 100%;
  transform: translate(-50%, -50%);
}


/* Style the tab content */
.tabcontent {
  float: left;
  padding: 0px 12px;
  border: none;
  width: 70vw;
  height: 90vw;
}
</style>