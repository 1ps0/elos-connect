// svelte.config.js
const preprocess = require('svelte-preprocess');

export default {
   (warning, handler) => {
    const { code, frame } = warning;
    if (code === "css-unused-selector")
      return;

    handler(warning);
  }
}
