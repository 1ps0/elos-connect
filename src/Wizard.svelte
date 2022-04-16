<script>

import { onMount } from 'svelte';
import ItemList from "./ItemList.svelte";
import Files from "./Files.svelte"

export let selected_files = [];
$: selected_files;

let currentTab = 1; // Current tab is set to be the first tab (0)
// $: currentTab;

function showTab(n) {
  // This function will display the specified tab of the form...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  //... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Preview";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }  //... and run a function that will display the correct step indicator:
  fixStepIndicator(n)
  currentTab = n;
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  // if (n == 1) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form...
  if (currentTab >= x.length) {
    // ... the form gets submitted:
    document.getElementById("regForm").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  if (x[n] === undefined)
    return;
  //... and adds the "active" class on the current step:
  x[n].className += " active";
}

onMount(() => {
  print.success_Wizard_mounted();
  showTab(1); // Display the current tab
});




</script>
<!--
Steps
1. Input type: Url or File
2. Add urls or files
3. list some simple actions that are validated as possible

actions:
- apply template
- detect content type: mime, extract images, guess textbook/other
-

templates/processing actions:
- extract: {format: textbook, type: lecture 1}
- website: [site for site in extract_children_links(url)]
- video: transcript and audio extraction. timeline it.
- summarize text:
- format json into markdown
- format yml to json or markdown
- format xml to json or markdown
- format html to json? (not ebnf compatible?) or markdown?
- extract pdf data (tables, images, etc)
-->

<form id="regForm">
  <ItemList bind:queue={selected_files} on:dequeue />
  <div style="overflow:auto;">
    <div style="float:right;">
      <button type="button" id="prevBtn" on:click|preventDefault={() => nextPrev(-1)}>Previous</button>
      <button type="button" id="nextBtn" on:click|preventDefault={() => nextPrev(1)}>Next</button>
    </div>
  </div>
  <!-- Circles which indicates the steps of the form: -->
  <div style="text-align:center;margin-top:40px;">
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
  </div>

  <div class="tab">
    <Files bind:selected_files={selected_files} />
  </div>

  <div class="tab">
  </div>

  <div class="tab">
    <p>
      <button type="button" id="" on:click|preventDefault={() => (1)}>1</button>
    </p>
  </div>
</form>

<style>
</style>