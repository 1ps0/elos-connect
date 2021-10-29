<script>

import { onMount } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";
import { timerAction, formatTime, minutesToSeconds } from "./lib/clock.js";
import { createNotify } from "./lib/apis.js";
/* --- */

let timerInterval;
let timer;
let timerDurations = {
  "pomodoro_short":  minutesToSeconds(25),
  "pomodoro_medium":  minutesToSeconds(45),
  "break_short":  minutesToSeconds(5),
  "break_medium":  minutesToSeconds(15),
};

const timerTypes = ["break", "work", "study"];

export let startTime = timerDurations.pomodoro_short;
$: console.log("TIMER START TIME", startTime);


let timerArgs = {
  interval: startTime,
  store: null,
  data: {},
  onEnd: () => {
    createNotify({
      title: 'Timer Completed!',
      message: `Pomodoro interval of ${interval} is complete.`
    });
  }
};

onMount(async () => {
  console.log('Timer mounted');
});


</script>

<section class="timer-container" use:timerAction={timerArgs}>
  <p class="timer"></p>
  <div class="control">
    <button name="start">Start</button>
    <button name="reset">Reset</button>
    <button name="pause">Pause</button>
    <button name="lap">Lap</button>
  </div>
</section>

<style>

p.timer {
  text-align: center;
  font-size: 18px;
}

section.timer-container {
  border: 1px solid black;
  padding: 10px;
  display: block;
  float: left;
  /*display: flex;*/
}

button {
  width: 100%;
}

div.control {
  border-top: 1px solid black;
  padding: 5px;
}



</style>
