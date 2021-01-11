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

let activeType = 0;
$: activeType = activeType % timerTypes.length;
$: console.log('activeType -->', activeType);

const addInterval = (time) => {
  timerQueue.push({
    timer: time
  });
  timerQueue = timerQueue;
};

const completeTimer = () => {
  if (++activeType == 0) {
    addInterval(BREAK_SHORT);
    timer = POMODORO_SHORT;
  } else {
    addInterval(POMODORO_SHORT);
    timer = BREAK_SHORT;
  }
  clearInterval(timerInterval);
};

const resetTimer = () => {
  clearInterval(timerInterval);
  if (activeType === 0) {
    timer = POMODORO_SHORT;
  } else {
    timer = BREAK_SHORT;
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

.type-label {
  border: 1px solid black;
  padding: 10px 30px 10px 30px;
  margin: 5px;
}

.timer-container section {
  border: 1px solid black;
  padding: 20px;/*
  display: flex;*/
}

div.control {
  border-top: 1px solid black;
  padding: 20px;
}

div.history {
  padding: 10px;
}

div.interval {
  border-top: 1px solid black;
  border-radius: 2px;
  background-color: #56CCF2;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  padding: 10px;
  display: flex;
  min-height: 20px;
  margin: 0em 0em 0.25em 0em;
}

div.interval-text {
  border-top: 1px solid black;
  border-radius: 5px;
  border-top-left-radius: 0%;
  border-top-right-radius: 0%;
  background-color: #2F80ED;
  color: #C4C4C4;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  padding: 5px;
  display: block;
  float: left;
}

div.remove {
  border-top: 1px solid black;
  border-radius: 5px;
  background-color: #707070;
  color: #C4C4C4;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  padding: 5px;
  display: block;
  float: right;
}


</style>
