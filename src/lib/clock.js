
import { readable } from 'svelte/store';

export const clockStore = readable(new Date(), function start(set) {
    const interval = setInterval(() => {
        set(new Date());
    }, 1000);

    return function stop() {
        clearInterval(interval);
    };
});

export const clockTimer = (node, args) => {
  const formatter = new Intl.DateTimeFormat('en', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });

  clockStore.subscribe((val) => {
    node.innerHTML = `${val.toLocaleDateString()} | ${formatter.format(val)}`;
  });

  return {
    update(val) {

    },
    destroy() {

    }
  }
};

