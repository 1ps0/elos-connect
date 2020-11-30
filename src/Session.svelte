<script>

import { eventHistory } from "./lib/event_history.js";

// import PkgEdit from "./PkgEdit.svelte";
// import Schedule from "./Schedule.svelte";
import Timer from "./Timer.svelte";
import AnnotationLog from "./AnnotationLog.svelte";
import ListQueue from "./ListQueue.svelte";

let polls = [
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
];

let todoQueue = [
  {
    checked: false,
    text: "Coffee"
  },
  {
    checked: false,
    text: "Walk"
  },
  {
    checked: false,
    text: "Ring Fit"
  },
  {
    checked: false,
    text: "monk"
  },
  {
    checked: false,
    text: "elos"
  },
  {
    checked:false,
    text: "social native"
  }
];
let eventList = [
  {
    is_me: false,
    profile: "",
    text: "Pay Insurance this month"
  }
];

</script>

<section>
<!--
  <table id="prompt-table">
    {#each prompts as prompt}
      <tr>
        <td>
          <Prompt data={prompt} />
        </td>
      </tr>
    {/each}
  </table>
-->
  <!-- <Schedule /> -->
  <!-- <AnnotationLog messages={notesLog} /> -->
  <ListQueue bind:queue={todoQueue} on:dequeue />
  <Timer />
  <!-- <ListQueue bind:queue={doneQueue} on:dequeue /> -->
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
