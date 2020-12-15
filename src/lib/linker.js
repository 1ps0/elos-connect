
/*

Gearbox

This is the set of functions which manage file extension and component associations
Swap this gearbox for others to change how the application associates and launches data.

Type 1: Naive.
> An OS-style extension-program linker with defaults.

- getComponentForExtension
- setComponentForExtension

- iterateComponents
- iterateExtensions

- setDefaultComponentForExtension
- getDefaultComponentForExtension
- setDefaultComponent

- saveChangesLocal
- saveChangesRemote

- addRemote
- removeRemote

- addLocalNamespace
- removeLocalNamespace

for Svelte, define as an action set

*/

/*
<Component use:action={parameters}/>
action = (node: HTMLEelement, parameters: any) => {
  update?: (parameters: any) => void,
  destroy?: () => void
}
*/

import { createEventDispatcher } from 'svelte';
import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";


export function linker(node, file) {

  const dispatch = createEventDispatcher();
  const historyWritable = getContext("eventHistory");
  // const _handler = (e) => { console.log("linker handled", e); };

  // const updateEditorSource = (source) => {
  //   historyWritable.update(n => n.editor.sourceContent = source);
  // }
  const openFileHandler = (e) => {
    e.preventDefault();
    dispatch('openFile', {
      source: "fileset",
      data: file
    });
  }
  // const cells = node.cells;
  // const openCell = cells.namedItems("file-open");

  // node.addEventListener('openFile', _handler);
  // on:click|preventDefault={() =>
  node.addEventListener('click', openFileHandler);

  // console.log("linker found", node, file);

  return {
    update(newFile) {
      // console.log("linker got update", newFile);
      // file = newFile;
    },
    destroy() {
      console.log("linker is destroyed");
      // node.removeEventListener('openFile', _handler);
      // node.removeListener('click', openFileHandler);
    }
  };
}

// export function longpress(node, values) {
//   let timer;
//   let duration = values.duration;
//   let spiciness = values.spiciness;

//   const handleMousedown = () => {
//     console.log(duration, spiciness, values);
//     timer = setTimeout(() => {
//       node.dispatchEvent(
//         new CustomEvent('longpress')
//       );
//     }, duration);
//   };

//   const handleMouseup = () => {
//     clearTimeout(timer)
//   };

//   node.addEventListener('mousedown', handleMousedown);
//   node.addEventListener('mouseup', handleMouseup);

//   return {
//     update(newDuration) {
//       duration = newDuration;
//     },
//     destroy() {
//       node.removeEventListener('mousedown', handleMousedown);
//       node.removeEventListener('mouseup', handleMouseup);
//     }
//   };
// }