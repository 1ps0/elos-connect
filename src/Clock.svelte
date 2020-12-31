<script>
import { onMount } from 'svelte';
import { clockAction, clockStore } from "./lib/clock.js";



onMount(async () => {
  console.log('Clock mounted');
});

</script>

<section class="title">
    <span use:clockAction class="datetime"></span>
</section>

<style>

.title {
  background-color: #ccc;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  outline: none;
}


.datetime {
  font-size: 20px;
  padding: 10px;
}

</style>