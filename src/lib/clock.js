import { readable } from "svelte/store";

export const minutesToSeconds = (minutes) => minutes * 60;
export const secondsToMinutes = (seconds) => Math.floor(seconds / 60);
export const padWithZeroes = (number) => number.toString().padStart(2, "0");
export const capitalize = (phrase) => {
  return phrase.replace(/^\w/, (c) => {
    return c.toUpperCase();
  });
};

// render functions for content
export const formatTime = (timeInSeconds) => {
  const minutes = secondsToMinutes(timeInSeconds);
  const remainingSeconds = timeInSeconds % 60;
  return `${padWithZeroes(minutes)}:${padWithZeroes(remainingSeconds)}`;
};

export const clockFormatter = new Intl.DateTimeFormat("en", {
  hour12: true,
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

export const dateStringFromDate = (date) => date.toLocaleDateString();
export const dateStringNow = () => dateStringFromDate(new Date());

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
    node.innerHTML = `${dateStringFromDate(val)} | ${clockFormatter.format(
      val
    )}`;
  });

  return {
    update(val) {},
    destroy() {},
  };
};

// import { clockStore } from "./clock.js"

export const timerAction = (node, args) => {
  let _args = args;
  let started = false;
  let interval = _args.interval;
  let timerP = node.querySelector("p.timer");
  console.log("Loading TIMERACTION", node, "|", _args, "|", timerP);

  let unsubscribe = clockStore.subscribe((val) => {
    let doc = document.querySelector("p.timer");
    if (doc && started) {
      console.log(
        "p.timer",
        doc,
        interval,
        formatTime(interval),
        doc.innerHTML
      );
      doc.innerHTML = formatTime(interval);
      interval -= 1;
      args.onEnd ? args.onEnd() : null;
    }
  });

  node.querySelectorAll("button").forEach((button) => {
    switch (button.name) {
      case "start":
        button.addEventListener("click", (e) => {
          started = true;
          e.preventDefault();
        });
        break; // args.start
      case "reset":
        button.addEventListener("click", (e) => {
          started = false;
          interval = _args.interval;
          doc.innerHTML = formatTime(interval);
          e.preventDefault();
        });
        break;
      case "pause":
        button.addEventListener("click", (e) => {
          started = false;
          e.preventDefault();
        });
        break;
      case "lap":
        button.addEventListener("click", (e) => {
          interval = args.interval;
          doc.innerHTML = formatTime(interval);
          // TODO register data somewhere
          e.preventDefault();
        });
        break;
    }
  });

  return {
    update(val) {},
    destroy() {
      unsubscribe();
    },
  };
};
