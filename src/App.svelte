<script>
import { onMount } from 'svelte';


import Controls from "./Controls.svelte";
import Dashboard from "./Dashboard.svelte";
import PkgIndex from "./PkgIndex.svelte";
import Fileset from "./Fileset.svelte";
import Session from "./Session.svelte";

export let viewer_file = "docs/A teleosemantic approach to information in the brain.pdf";
$: viewer_file = `/api/load?filepath=${viewer_file}`;

function toggleAccordion() {
  /* Toggle between adding and removing the "active" class,
  to highlight the button that controls the panel */
  this.classList.toggle("active");

  /* Toggle between hiding and showing the active panel */
  var panel = this.nextElementSibling;
  if (panel.style.display === "block") {
    panel.style.display = "none";
  } else {
    panel.style.display = "block";
  }
}
// require.config({ paths: { vs: '../node_modules/monaco-editor/min/vs' } });

// require(['vs/editor/editor.main'], function () {
//   var editor = monaco.editor.create(document.getElementById('container'), {
//     value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
//     language: 'javascript'
//   });
// });

onMount(async () => {
  console.log('mounted');

});

let menuItems = [
  { target: "menu-item-dashboard", name: "Dashboard" },
  { target: "menu-item-controls", name: "Controls" },
  { target: "menu-item-open", name: "Open File" },
  // { target: "menu-item-timer", name: "Timer" },
  { target: "menu-item-session", name: "Session" },
  { target: "menu-item-pkgindex", name: "PkgIndex" },
  { target: "menu-item-fileset", name: "Fileset" },
  // { target: "menu-item-", name: "" },
];
$: menuItems;

</script>

<main>
  <header id="menu-item-dashboard">
    <Dashboard />
  </header>
  <nav class="menu sidenav">
      {#each menuItems as item}
          <a href="#{item.target}" target="_blank" rel="noopener">
            {item.name}
          </a>
      {/each}
  </nav>

  <button class="accordion" on:click={toggleAccordion}>Controls</button>
  <div id="menu-item-controls" class="panel">
    <Controls />
  </div>

  <button class="accordion" on:click={toggleAccordion}>Open File</button>
  <div id="menu-item-open" class="panel">
    <iframe src={viewer_file} id="fileviewer" width="100%" height="500px"></iframe>
  </div>
<!--
  <button class="accordion" on:click={toggleAccordion} >Timer</button>
  <div id="menu-item-timer" class="panel">
    <CountdownTimer />
  </div>
 -->
  <button class="accordion" on:click={toggleAccordion}>Session</button>
  <div id="menu-item-session" class="panel">
    <Session />
  </div>

  <button class="accordion" on:click={toggleAccordion}>Pkg Index</button>
  <div id="menu-item-pkgindex" class="panel">
    <PkgIndex />
  </div>

  <button class="accordion" on:click={toggleAccordion}>File Index</button>
  <div id="menu-item-fileset" class="panel">
    <Fileset bind:viewer_file={viewer_file}/>
  </div>

</main>

<style>

@media screen and (max-height: 450px) {
  .sidenav {padding-top: 15px;}
  .sidenav a {font-size: 18px;}
}

.sidenav {
  width: 130px;
  position: fixed;
  z-index: 1;
  top: 20px;
  left: 10px;
  background: #eee;
  overflow-x: hidden;
  padding: 8px 0;
}

.sidenav a {
  padding: 6px 8px 6px 16px;
  text-decoration: none;
  font-size: 20px;
  color: #2196F3;
  display: block;
}

.sidenav a:hover {
  color: #064579;
}

/* Style the buttons that are used to open and close the accordion panel */
.accordion {
  background-color: #eee;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  text-align: left;
  border: none;
  outline: none;
  transition: 0.4s;
}

/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.active, .accordion:hover {
  background-color: #ccc;
}

/* Style the accordion panel. Note: hidden by default */
.panel {
  padding: 0 18px;
  background-color: white;
  display: none;
  overflow: hidden;
}

.accordion:after {
  content: '\02795'; /* Unicode character for "plus" sign (+) */
  font-size: 13px;
  color: #777;
  float: right;
  margin-left: 5px;
}

.active:after {
  content: "\2796"; /* Unicode character for "minus" sign (-) */
}

main {
  /*background-color: #222;*/
  /*text-align: center;*/
  /*padding: 1em;*/
  max-width: 1000px;
  margin: 0 auto;
  margin-left: 140px; /* Same width as the sidebar + left position in px */
  font-size: 28px; /* Increased text to enable scrolling */
  padding: 0px 10px;
}

</style>