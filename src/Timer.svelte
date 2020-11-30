<script>

import { eventHistory } from "./lib/event_history.js";

/* --- */
const minutesToSeconds = (minutes) => minutes * 60;
const secondsToMinutes = (seconds) => Math.floor(seconds / 60);
const padWithZeroes = (number) => number.toString().padStart(2, '0');
const capitalize = (phrase) => {
    return phrase.replace(/^\w/, (c) => {
        return c.toUpperCase();
    })
};

// render functions for content
function formatTime(timeInSeconds) {
    const minutes = secondsToMinutes(timeInSeconds);
    const remainingSeconds = timeInSeconds % 60;
    return `${padWithZeroes(minutes)}:${padWithZeroes(remainingSeconds)}`;
}

const POMODORO_SHORT = minutesToSeconds(25);
const POMODORO_MEDIUM = minutesToSeconds(45);
const BREAK_SHORT = minutesToSeconds(5);
const BREAK_MEDIUM = minutesToSeconds(15);

const timerTypes = ["break", "work", "study"];

export let startTime = POMODORO_SHORT;

let activeType = 0;
$: activeType = activeType % timerTypes.length;
$: console.log('activeType -->', activeType);

export let timer = startTime;
$: timer;


let timerInterval;
const completeTimer = () => {
    if (++activeType == 0) {
        addInterval(BREAK_SHORT);
        timer = POMODORO_SHORT;
    } else {
        addInterval(POMODORO_SHORT);
        timer = BREAK_SHORT;
    }
    clearInterval(timerInterval);
}
const startTimer = () => {
    timerInterval = setInterval(() => {
        timer -= 1;
        if (timer === 0) {
            completeTimer();
        }
    }, 1000);
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
const lapTimer = () => {
    completeTimer();
    startTimer();
};

// let timerQueue;
// $: timerQueue;
const addInterval = (time) => {
    timerQueue.push({
        timer: time
    });
    timerQueue = timerQueue;
};
// const removeInterval = (e) => {
//     e.target.parentElement.remove();
// };


</script>

<section class="timer-container" use:eventHistory={timer}>
    <p class="timer">{formatTime(timer)}</p>
    <slot name="before"></slot>
    <div class="control">
        <button on:click={startTimer}>Start</button>
        <button on:click={resetTimer}>Reset</button>
        <button on:click={pauseTimer}>Pause</button>
        <button on:click={lapTimer}>Lap</button>
    </div>
    <slot name="after"></slot>

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
