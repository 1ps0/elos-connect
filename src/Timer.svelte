<script>

import { onMount } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";
import { timerAction, formatTime, minutesToSeconds } from "./lib/clock.js";

/* --- */

let timerDurations = {
  "pomodoro_short":  minutesToSeconds(25),
  "pomodoro_medium":  minutesToSeconds(45),
  "break_short":  minutesToSeconds(5),
  "break_medium":  minutesToSeconds(15),
};

const timerTypes = ["break", "work", "study"];

export let startTime = timerDurations.pomodoro_short;
$: console.log("TIMER START TIME", startTime);

let activeType = 0;
$: activeType = activeType % timerTypes.length;
// $: console.log('activeType -->', activeType);

const addInterval = (time) => {
  timerQueue.push({
    timer: time
  });
  timerQueue = timerQueue;
};

const completeTimer = () => {
  if (++activeType == 0) {
    addInterval(timerDurations.break_short);
    timer = timerDurations.pomodoro_short;
  } else {
    addInterval(timerDurations.pomodoro_short);
    timer = timerDurations.break_short;
  }
  clearInterval(timerInterval);
};

const resetTimer = () => {
  clearInterval(timerInterval);
  if (activeType === 0) {
    timer = timerDurations.pomodoro_short;
  } else {
    timer = timerDurations.break_short;
  }
};

const pauseTimer = () => {
  clearInterval(timerInterval);
};

let timerArgs = {
  interval: startTime,
  complete: completeTimer,
  // start: startTimer,
  reset: resetTimer,
  pause: pauseTimer,
  // lap: lapTimer,
  data: {}
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

.timer-container section {
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
