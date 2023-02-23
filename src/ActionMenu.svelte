<script>
import { onMount } from 'svelte';


import { 
  relectedCopy,
  rownloadVideo,
  reloadSystem,
  applyDarkMode,
  extractReaderText,
} from "./lib/actions.js";
import * as proxy from "./lib/apis/proxy.js";


// let savePDFButton = document.querySelector('#save-pdf');
// let courseDataElement = document.querySelector('#active-course-data');

let enabledCourseSites = [
  "coursera.org",
  "edx.org",
  "udemy.com",
  "khanacademy.org"
];


// --------


// --------

let items = [
  {
    title: 'Reload eLOS',
    click: reloadSystem
  },
  {
    title: 'Set Dark mode 1',
    click: applyDarkMode,
  },
  {
    title: 'Extract Text',
    click: extractReaderText,
  },
  {
    title: 'Copy Selected Tabs',
    click: selectedCopy
  },
  {
    title: 'Download Video',
    click: downloadVideo
  },
]
onMount(async () => {
  proxy.print.success_ActionMenu_mounted();
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