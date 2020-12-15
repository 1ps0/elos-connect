
import { readable } from 'svelte/store';

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

export const clockTimer = (node, args) => {

  clockStore.subscribe((val) => {
    node.innerHTML = `${dateStringFromDate(val)} | ${clockFormatter.format(val)}`;
  });

  return {
    update(val) {

    },
    destroy() {

    }
  }
};

