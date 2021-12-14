<script>

// import { onMount } from 'svelte';
// import { _fetch, _send } from "./lib/apis.js";

// // import * as monaco from 'monaco-editor';

// export let editor;
// let rootEl;

// export let data = null;
// export let theme = 'vs-light';
// export let language = 'markdown';
// export let features = ["wordWrap", ];

// const jsonfiy = (lang, intake) => {
//     try {
//         if (lang === "json")
//             return JSON.stringify(intake, null, 4);
//         return ""+intake;
//     } catch (e) {
//         console.log("error jsonifying", e, intake);
//         return ""+intake;
//     }
// }

// let _data = null;
// $: {
//     if (editor && data && _data === null) {
//         _fetch(data)
//         .then((x) => {
//             _data = x;
//             if (_data) {
//                 state.source = _data;
//                 editor.getModel().setValue(jsonfiy(state.language, _data));
//                 editor.layout();
//             }
//         });
//     }
// }


// export let state = {};

// $: state = {
//     source: null,
//     theme: theme,
//     language: language,
//     features: features
// };

// $: state.language = ((x) => {
//     switch (x) {
//         case "md": return "markdown";
//         case "js": return "javascript";
//         case "py": return "python";
//         default: return x;
//     }
// })(language);

// export let controls = [
//     {
//         save: (target, __data) => {
//             console.log("saved", target, __data);
//             _send(target, { data: __data })
//         }
//     },
// ];


// export let onChange = [ ((e) => { console.log('onchange: ', e) }),];

// onMount(async () => {
//   console.log('Editor mounted');

//   rootEl = document.getElementById('editorRoot');
//   // editor = monaco.editor.create(rootEl, {
//   //   // value: JSON.stringify(state.source, null, 4),
//   //   language: state.language,
//   //   theme: state.theme,
//   //   features: state.features,
//   //   automaticLayout: true
//   // });
//   // // rootEl.onresize = () => editor.layout();
//   // editor.getModel().onDidChangeContent( (e) => {
//   //   for (let x = 0; x < onChange.length; x++) {
//   //       onChange[x](e);
//   //   }
//   // });


// });



</script>

<!-- <div id="controls">
    {#each Object.entries(controls) as control, key }
    <button id="{key}" on:click={control}>{key.toUpperCase()}</button>
    {/each}
</div> -->
<!-- <div id="editorRoot" on:didFocusEditorText={ _ => editor.layout()}></div> -->


<style>

#editorRoot {
    display: block;       /* iframes are inline by default */
    border: none;         /* Reset default border */
    top: 40px;
    left: 0;
    right: 0;
    /*bottom: 0;*/
    height: 50vh;       /* Viewport-relative units
    /*width: 80vw;*/
    resize: vertical;
    overflow: auto;
    margin: 0 auto;
}

</style>
