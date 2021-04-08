<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";
import { _fetch } from "./lib/apis.js";

import * as monaco from 'monaco-editor';

export let data = null;
export let theme = 'vs-light';
export let language = 'markdown';
export let features = ["wordWrap", ];

// import Editor from 'tailwind-editor';

export let html = '';
$: html;

const jsonfiy = (intake) => {
    try {
        return JSON.stringify(intake, null, 4);
    } catch (e) {
        console.log("error jsonifying", e, intake);
        return intake;
    }
}

let _data = null;
let rootEl;
export let editor;
$: {
    if (editor && data) {
        _fetch(data)
        .then((x) => {
            _data = x;
            if (_data) {
                editor.getModel().setValue(""+jsonfiy(_data));
                editor.layout();
            }
        })
    }
}


export let state = {};
$: state = {
    source: _data,
    language: language,
    theme: theme,
    features: features
};

export let controls = {
    save: (target, __data) => { console.log("saved", target, __data) },
};


export let onChange = [ ((e) => { console.log('onchange: ', e) }),];

onMount(async () => {
  console.log('Editor mounted');

  rootEl = document.getElementById('editorRoot');
  editor = monaco.editor.create(rootEl, {
    // value: JSON.stringify(state.source, null, 4),
    language: state.language,
    theme: state.theme,
    features: state.features,
    automaticLayout: true
  });
  // rootEl.onresize = () => editor.layout();
  editor.getModel().onDidChangeContent( (e) => {
    for (let x = 0; x < onChange.length; x++) {
        onChange[x](e);
    }
  });


});



</script>
<div id="controls">
    {#each controls as control (key)}
    <button id="{key}" on:click={control}>{key.toUpperCase()}</button>
    {/each}
</div>
<div id="editorRoot" on:didFocusEditorText={() => editor.layout() }></div>
<!-- <Editor bind:html={html} {_data} /> -->

<style>

#editorRoot {
    display: block;       /* iframes are inline by default */
    border: none;         /* Reset default border */
    top: 0;
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
