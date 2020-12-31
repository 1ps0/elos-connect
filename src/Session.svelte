<script>

import { onMount } from 'svelte';
import { writable } from "svelte/store";

import { historyWritable, filesWritable, registeredActions } from "./lib/stores.js"
import { updateHistory } from "./lib/apis.js";

import Timer from "./Timer.svelte";
import ItemList from "./ItemList.svelte";

let pollsWritable = writable([
  {
    title: "Current Stress",
    name: "stress",
    context: "current_time",
    category: "personal_metric",
    value_type: "float",
    value_control: false
  },
  {
    title: "Calorie Intake",
    name: "calories",
    context: "food",
    category: "personal_metric",
    value_type: "integer",
    value_control: false
  },
  {
    title: "Current Stress",
    name: "stress",
    context: "current_time",
    category: "personal_metric",
    value_type: "float",
    value_control: false
  },
  {
    title: "Day Start",
    message: "What is your main focus today?",
    affinity: "morning",
    category: "session_prompt",
    value_type: "text",
    value_control: false
  },
  {
    title: "Day Evening",
    message: "What are you most proud of today?",
    affinity: "evening",
    category: "session_prompt",
    value_type: "text",
    value_control: false
  },
  {
    title: "Day Check-in",
    message: "What's on your mind?",
    affinity: "checkin",
    category: "session_prompt",
    value_type: "text",
    value_control: false
  },
]);

let todoWritable = writable([
  {
    checked: false,
    data: {
      name: "Coffee"
    },
  },
  {
    checked: false,
    data: {
      name: "Walk"
    },
  },
  {
    checked: false,
    data: {
      name: "Ring Fit"
    },
  },
  {
    checked: false,
    data: {
      name: "Monk"
    },
  },
  {
    checked: false,
    data: {
      name: "elos"
    },
  },
  {
    checked: false,
    data: {
      name: "social native"
    },
  }
]);

let timer;

</script>

<section>
  <Timer bind:timer />
  <ItemList dataStore={todoWritable} on:didClick={updateHistory} />
</section>

<style>

table {
  padding: 20px 20px 20px 20px;
}

tr {
  text-transform: uppercase;
  font-size: 1em;
}

.header tr {
  color: #ff3e00; /* blue */
}

.control tr {
  color: #ff3e00; /* orange */
}

#prompt-table {

}

</style>
