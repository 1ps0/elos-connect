<script>

// code for custom select...
var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);

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

<section class="timer-container">
    <p>{formatTime(timer)}</p>
    <slot name="before"></slot>
    <div class="control">
        <div class="type-label custom-select" style="width:200px;">
          <select>
            {#each timerTypes as timerType, i}
                <option value="{i}" class="{i == activeType ? 'active' : ''}">
                    {capitalize(timerType)}
                    {@debug timerType, i}
                </option>
            {/each}
          </select>
        </div>
        <button on:click={startTimer}>Start</button>
        <button on:click={resetTimer}>Reset</button>
        <button on:click={pauseTimer}>Pause</button>
        <button on:click={lapTimer}>Lap</button>
    </div>
    <slot name="after"></slot>
<!--
    <hr/>
    <div class="history">
        {#each timerQueue as event}
            <div class="interval">
                <div class="interval-text">{secondsToMinutes(event.timer)}</div>
                <div class="remove" on:click|once={removeInterval}>rm</div>
            </div>
        {/each}
    </div>
-->

</section>

<style>

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

/* -------- */

/* The container must be positioned relative: */
.custom-select {
  position: relative;
  font-family: Arial;
}

.custom-select select {
  display: none; /*hide original SELECT element: */
}

.select-selected {
  background-color: DodgerBlue;
}

/* Style the arrow inside the select element: */
.select-selected:after {
  position: absolute;
  content: "";
  top: 14px;
  right: 10px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-color: #fff transparent transparent transparent;
}

/* Point the arrow upwards when the select box is open (active): */
.select-selected.select-arrow-active:after {
  border-color: transparent transparent #fff transparent;
  top: 7px;
}

/* style the items (options), including the selected item: */
.select-items div,.select-selected {
  color: #ffffff;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
  cursor: pointer;
}

/* Style items (options): */
.select-items {
  position: absolute;
  background-color: DodgerBlue;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 99;
}

/* Hide the items when the select box is closed: */
.select-hide {
  display: none;
}

.select-items div:hover, .same-as-selected {
  background-color: rgba(0, 0, 0, 0.1);
}

</style>
