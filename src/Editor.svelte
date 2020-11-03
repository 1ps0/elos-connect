<script>

import { onMount } from 'svelte';
import * as monaco from 'monaco-editor';

export let fileset_selected;
$: fileset_selected;

export let defaults = {
    source: '{ 1: "Hello World" }',
    language: 'markdown',
    theme: 'vs-dark',
    features: ["wordWrap", ]
};

export let data = {};
$: {
    data = {...defaults, source: {
            dependencies: {
                local: fileset_selected
            }
        }
    };
    if (editor) {
        editor.setValue(JSON.stringify(data.source, null, 4));
        editor.layout();
    }
    console.log("updating data...", data);
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
    var x, updatedValues;
    for (x = 0; x < onChange.length; x++) {
        onChange[x](e);
    }
    updatedValues = editor.getValue();
    if (updatedValues["dependencies"] != undefined &&
        updatedValues["dependencies"]["local"] != undefined) {
        fileset_selected = updatedValues["dependencies"]["local"];
    }
  });
});



</script>

<div id="editorRoot" on:didFocusEditorText={() => editor.layout() }></div>

<style>

#editorRoot {
    display: block;       /* iframes are inline by default */
    background: #000;
    border: none;         /* Reset default border */
    height: 70vh;        /* Viewport-relative units */
    width: 80vw;
    resize: vertical;
    overflow: auto;
}

</style>
