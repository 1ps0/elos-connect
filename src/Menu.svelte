<script>

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

function handleMessage(event) {
  // alert(event.detail.text);
}

function sayHello() {
  dispatch('message', {
    text: 'Hello!'
  });
}

// export let

</script>

<div class="header">
  <!-- <Overview on:message={handleMessage}/> -->
  <!-- <Session on:message={handleMessage}/> -->
  <!-- <Dashboard on:message={handleMessage}/> -->
  <!-- <Files on:message={handleMessage}/> -->
  <!-- <Document on:message={handleMessage}/> -->
</div>
<div class="header-right">...</div>



<style>

.header {
  float: left;
  background: #efefef;
  background-repeat: no-repeat;
  width: 240px;
  height: 100px;
}

.header-right {
  overflow: hidden;
  background-color: #000;
  height: 100px;
}

</style>

