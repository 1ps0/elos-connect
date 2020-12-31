
import { readable } from 'svelte/store';

// render functions for content
export const formatTime = (timeInSeconds) => {
  const minutes = secondsToMinutes(timeInSeconds);
  const remainingSeconds = timeInSeconds % 60;
  return `${padWithZeroes(minutes)}:${padWithZeroes(remainingSeconds)}`;
};

export const clockFormatter = new Intl.DateTimeFormat('en', {
  hour12: true,
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit'
});

export const dateStringFromDate = (date) => date.toLocaleDateString();

export const clockStore = readable(new Date(), function start(set) {
    const interval = setInterval(() => {
        set(new Date());
    }, 1000);

    return function stop() {
        clearInterval(interval);
    };
});

export const clockAction = (node, args) => {
  clockStore.subscribe((val) => {
    node.innerHTML = `${dateStringFromDate(val)} | ${clockFormatter.format(val)}`;
  });

  return {
    update(val) {},
    destroy() {}
  }
};

// import { clockStore } from "./clock.js"

export const timerAction = (node, args) => {
  let timer = args.interval;
  let buttons = document.querySelector("button");
  for (let button in buttons) {
    switch(button.name) {
      case "start": button.addEventListener("click", args.start); break;
      case "reset": button.addEventListener("click", args.reset); break;
      case "pause": button.addEventListener("click", args.pause); break;
      case "lap":   button.addEventListener("click", args.lap); break;
    }
  }
  clockStore.subscribe((val) => {

  });

  node.addEventListener("", (e) => {});

  return {
    update(val) {},
    destroy() {}
  }
};



