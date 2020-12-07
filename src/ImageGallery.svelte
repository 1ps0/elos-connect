<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

export let images = [];

// Get the elements with class="column"
let elements = document.getElementsByClassName("column");

// Full-width images
function scale(percent=25) {
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.flex = `${percent}%`;
  }
}

</script>

<section>

<div class="row">
    <div class="column">
      {#each images as image}
        <img src="{image}"/>
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
  flex: 50%;
  padding: 0 4px;
}

.column img {
  margin-top: 8px;
  vertical-align: middle;
}
</style>
