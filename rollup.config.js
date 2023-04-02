import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import css from "rollup-plugin-css-only";

const production = !process.env.ROLLUP_WATCH;

function getCommonPlugins(cssOutput) {
  return [
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),
    css({ output: cssOutput }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
      exportConditions: ['svelte', 'browser', 'module', 'import', 'default']
    }),
    commonjs(),
  ];
}

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

console.log(process.cwd(), __dirname);

export default [
  {
    input: "src/main.js",
    output: {
      inlineDynamicImports: true,
      sourcemap: true,
      format: "iife",
      name: "app",
      file: "public/build/bundle.js",
    },
    plugins: getCommonPlugins("css/bundle.css"),
    watch: {
      clearScreen: false,
    },
  },
  {
    input: "src/background.js",
    output: {
      inlineDynamicImports: true,
      sourcemap: true,
      format: "iife",
      file: "public/build/background.js",
    },
    plugins: getCommonPlugins("css/background.css"),
    watch: {
      clearScreen: false,
    },
  },
  {
    input: "src/content_actions.js",
    output: {
      sourcemap: true,
      format: "iife",
      file: "public/build/content_actions.js",
    },
    plugins: getCommonPlugins("css/content_actions.css"),
    watch: {
      clearScreen: false,
    }
  }
];
