<script>
import { onMount } from 'svelte';

import Editor from "./Editor.svelte";
import PkgIndex from "./PkgIndex.svelte";
import PkgCreate from "./PkgCreate.svelte";
import Fileset from "./Fileset.svelte";
import Session from "./Session.svelte";
import Frame from "./Frame.svelte";
import DataGrid from "./DataGrid.svelte";

let fileset_selected;
let viewer_file;
let menu_items = [
  { target: "menu-item-create", name: "Create Pkg" },
  { target: "menu-item-metrics", name: "Metrics" },
  { target: "menu-item-open", name: "Open File" },
  { target: "menu-item-notes", name: "Notes" },
  { target: "menu-item-session", name: "Session" },
  { target: "menu-item-pkgindex", name: "PkgIndex" },
  { target: "menu-item-fileset", name: "Fileset" },
  // { target: "menu-item-", name: "" },
];
$: menu_items;


function searchFilter() {
  // Declare variables
  var input, filter, ul, li, a, i;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  ul = document.getElementById("menu");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function showTab(e) {
  var name = e.currentTarget.href.split('#')[1];
  var i, tabcontent, tablinks, el;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  el = document.getElementById(name);
  if (!el) return;

  el.style.display = "block";
  e.currentTarget.className += " active";
}

onMount(async () => {
  console.log('MainMenu mounted');
  document.getElementsByClassName("defaultOpen")[0].click();
});

// <MarkdownEditor />
</script>

<section>

  <input type="text" id="search" on:change={searchFilter} placeholder="Search...">

  <div class="tab">
    <ul id="menu">
      {#each menu_items as item}
      <li>
        <a href="#{item.target}" class="tablinks" on:click|preventDefault={showTab}>
          {item.name}
        </a>
      </li>
      {/each}
    </ul>
  </div>
  <div id="menu-item-metrics" class="tablecontent defaultOpen">
    <DataGrid />
  </div>

 <!--
  <div id="menu-item-create" class="tablecontent">
    <PkgCreate />
  </div>


  <div id="menu-item-open" class="tabcontent">
    <Frame bind:viewer_file={viewer_file}/>
  </div>

  <div id="menu-item-notes" class="tabcontent">
    <Editor />
  </div>

  <div id="menu-item-session" class="tabcontent">
    <Session />
  </div>

  <div id="menu-item-fileset" class="tabcontent">
    <Fileset bind:viewer_file={viewer_file} bind:selected={fileset_selected}/>
  </div>

  <div id="menu-item-pkgindex" class="tabcontent">
    <PkgIndex />
  </div>
  -->
</section>

<style>

/*
  Menu Tabs
  https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_search_menu
*/

section {
  font-family: Arial, Helvetica, sans-serif;
}

* {
  box-sizing: border-box;
}

/* Create a column layout with Flexbox */
.row {
  display: flex;
}

/* Left column (menu) */
.left {
  flex: 35%;
  padding: 15px 0;
}

.left h2 {
  padding-left: 8px;
}

/* Right column (page content) */
.right {
  flex: 65%;
  padding: 15px;
}

 /* Style the search box */
#search {
  width: 100%;
  font-size: 18px;
  padding: 11px;
  border: 1px solid #ddd;
}

/* Style the navigation menu */
#menu {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

/* Style the navigation links */
#menu li a {
  padding: 12px;
  text-decoration: none;
  color: black;
  display: block
}

#menu li a:hover {
  background-color: #eee;
}

/*
  Menu Vis
  https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_vertical_tabs
*/

/* Style the tab */
.tab {
  float: left;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
  width: 10vw;
  height: 90%;
}

/* Style the buttons inside the tab */
.tab li {
  display: block;
  background-color: inherit;
  color: black;
  padding: 22px 16px;
  width: 100%;
  border: none;
  outline: none;
  text-align: left;
  cursor: pointer;
  transition: 0.3s;
  font-size: 17px;
}

/* Change background color of lis on hover */
.tab li:hover {
  background-color: #ddd;
}

/* Create an active/current "tab li" class */
.tab li.active {
  background-color: #ccc;
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