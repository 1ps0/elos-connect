<script>
import { onMount } from 'svelte';
import { registerCronEvent, getCronEvents, deleteCronEvent } from './lib/apis/cron.js';

import * as proxy from "./apis/proxy.js";

let cronEvents = [];

onMount(async () => {
  cronEvents = await getCronEvents();
});

function addCronEvent(event) {
  registerCronEvent(event)
    .then(() => getCronEvents())
    .then(events => {
      cronEvents = events;
    })
    .catch(error => console.error(error));
}

function removeCronEvent(event) {
  deleteCronEvent(event)
    .then(() => getCronEvents())
    .then(events => {
      cronEvents = events;
    })
    .catch(error => console.error(error));
}
</script>

<h3>Cron Events</h3>
<ul>
  {#each cronEvents as event}
    <li>
      {event.name}: {event.schedule}
      <button on:click={() => removeCronEvent(event)}>Remove</button>
    </li>
  {/each}
</ul>

<input type="text" placeholder="Event Name" bind:value={eventName} />
<input type="text" placeholder="Event Schedule" bind:value={eventSchedule} />
<button on:click={() => addCronEvent({ name: eventName, schedule: eventSchedule })}>
  Add Event
</button>
