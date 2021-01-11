
/*

CommandLine control
- each component can register a set of actions with callback
- commandline taps into these actions via `registeredActions` context
- each component subscribes to changes in their actions
- TODO investigate derived stores
- TODO investigate pipe type actions
- can output into a relative result box
- can output to a new panel for results if appropriate
- possibly use pipe here for output reasons
- namespacing:
  - for command search; CMD PARAMS(?)
  - for preferences set; PREF PARAM(?)
  - for workspace command; TARGET ACTION PARAM(?)
  - for unix-type action; CMD PARAM [(| CMD), (> TARGET), (< TARGET)]
- color code the input box based on recognized type of input (or selected)

*/

/*
<Component use:action={parameters}/>
action = (node: HTMLEelement, parameters: any) => {
  update?: (parameters: any) => void,
  destroy?: () => void
}
*/

import { createEventDispatcher } from 'svelte';
// import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { historyWritable, filesWritable, registeredActions, workspaceWritable, profileWritable } from "./stores.js";

const stores = {
  history: historyWritable,
  files: filesWritable,
  actions: registeredActions,
  workspace: workspaceWritable,
  profile: profileWritable
};

const splitInputs = (val) => { return val.split(":") };

// const inputSplits = {
//   command: (val) => { val },
//   preferences: (val) => { val },
//   workspace: (val) => { val },
//   session: (val) => { val },
// };

export function commandLine(node, store) {
  console.log("[init][action] commandLine", node, store);
  console.log("[->action]", get(store).actions());
  const dispatch = createEventDispatcher();
  store.subscribe(val => {
    console.log("[action] commandLine got update", val);
  });
  // const dashboardWritable = getContext("dashboard");
  // const historyWritable = getContext("eventHistory");
  // const registeredActions = getContext("registeredActions");

  const enterKeyPressed = (event) => { return event.keyCode === 13 };

  // let form = new FormData();

  const inputTypes = {
    cmd: (args) => {}, // command
    pref: (args) => {}, // preferences
    panel: (args) => { get(registeredActions)[args[0]](args[1]) }, // panel
    do: (args) => {}, // session
  };

  const submitCommand = (e) => {
    // console.log("got keypress", e);
    if (!enterKeyPressed(e)) {
      // console.log("not keypress submit", e);
      return e;
    }

    let cmd = node.value;
    let parts = splitInputs(cmd);
    if (parts.length === 0) {
      // RNF invalid command

    } else if (parts.length === 1 && parts[0] === cmd) {
      // TODO normal search here

    } else {
      let _cmdWord = parts[0];
      let _cmdArgs = parts[1].split(" ");
      let _cmdFunc = inputTypes[_cmdWord];
      if (!_cmdFunc) {
        console.log("no func for", _cmdWord, _cmdArgs);
      }

      let _cmdResult = _cmdFunc(_cmdArgs);
      console.log("cmd result was", _cmdWord, _cmdArgs, _cmdResult);

      historyWritable.update(n => [...n, [_cmdWord, _cmdArgs, _cmdResult]]);
    }

    // dispatch('openFile', {
    //   source: "fileset",
    //   data: file
    // });

  }
  node.placeholder = "'do:tutorial' to get started";
  node.addEventListener('keypress', submitCommand);

  return {
    update(newFile) {
      console.log("commandline got update", newFile);
    },
    destroy() {
      console.log("commandline is destroyed");
      node.removeListener('keypress', submitCommand);
    }
  };
}
