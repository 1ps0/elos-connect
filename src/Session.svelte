<script>

// import PkgEdit from "./PkgEdit.svelte";
// import Schedule from "./Schedule.svelte";
import CountdownTimer from "./CountdownTimer.svelte";
import AnnotationLog from "./AnnotationLog.svelte";
import ListQueue from "./ListQueue.svelte";

let timer;
let doneObj;
let todoObj;

let prompts = [
  {
    title: "Day Start",
    message: "What is your main focus today?",
    affinity: "morning"
  },
  {
    title: "Day Evening",
    message: "What are you most proud of today?",
    affinity: "evening"
  },
  {
    title: "Day Check-in",
    message: "What's on your mind?",
    affinity: "checkin"
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
let doneQueue = [
  {
    is_me: false,
    profile: "",
    text: "Pay Insurance this month"
  }
];
let notesLog = [
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
  <ListQueue queue={todoQueue} on:dequeue />
  <CountdownTimer timer={timer} />
  <ListQueue queue={doneQueue} on:dequeue />
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
