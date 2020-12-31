<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

export let images = [];
export let imageLinks = [];
export let dataStore;

$: imageLinks = images.slice(0,9).map((img) => {
  return `/api/load?filepath=${img.locations[0].split('/Volumes/ARCHIVE/')[1]}`;
});
$: console.log("images: ", imageLinks, images);

// Get the elements with class="column"
let elements = document.getElementsByClassName("column");

// Full-width images
function scale(percent=25) {
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.flex = `${percent}%`;
  }
}

onMount(async () => {
  console.log("ImageGallery mounted", $$props, $$restProps);
  if (dataStore !== undefined) {
    dataStore.subscribe((val) => {
      if (val === undefined) {
        console.log("ImageGallery dataStore had no value?", get(dataStore));
        return;
      }
      console.log("ImageGallery dataStore got update", val);
      if (val.files !== undefined && val.files.length > 0) {
        images = val.files;
      }
    });
  }
});

</script>

<section>

<div class="row">
    <div class="column">
      {#each imageLinks as image}
        <img src="{image}"/>
      {:else}
        No Data
      {/each}
    </div>
</div>

</section>

<style>
 .row {
  display: flex;
  flex-wrap: wrap;
  padding: 0 4px;
}

/* Create two equal columns that sits next to each other */
.column {
  flex: 100%;
  padding: 0 4px;
}

.column img {
  margin-top: 8px;
  vertical-align: middle;
}
</style>
