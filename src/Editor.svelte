<script>

import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import * as monaco from 'monaco-editor';

export let sourceContent = {};
export let theme = 'vs-light';
export let language = 'markdown';
export let features = ["wordWrap", ];

import Editor from 'tailwind-editor';

export let data = {};
export let html = '';

let _data = [{ html: "", klass: ""}];

$: html;
$: _data = data;

$: data = {
    source: sourceContent,
    language: language,
    theme: theme,
    features: features
};

export let controls = {
    save: (target, data) => { console.log("saved", target, data) },
};

$: {
    if (editor) {
        editor.setValue(JSON.stringify(sourceContent, null, 4));
        editor.layout();
    }
    console.log("updating data...", sourceContent);
}
let rootEl;
export let editor;

export let onChange = [ ((e) => { console.log('onchange: ', e) }),];

onMount(async () => {
  console.log('Editor mounted');

  rootEl = document.getElementById('editorRoot');
  editor = monaco.editor.create(rootEl, {
    // value: JSON.stringify(data.source, null, 4),
    language: data.language,
    theme: data.theme,
    features: data.features,
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
<Editor bind:html={html} {_data} />

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
