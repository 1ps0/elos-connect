<script>

import { onMount } from 'svelte';
import * as monaco from 'monaco-editor';

export let fileset_selected;
$: fileset_selected;

export let theme = 'vs-light';
export let language = 'markdown';

let defaults = {
    source: '',
    language: language,
    theme: theme,
    features: ["wordWrap", ]
};

export let controls = {
    save: (target, data) => { console.log("saved", target, data) },
};

export let source_content = {};
export let data = defaults;

$: data.source = source_content;
$: {
    if (editor) {
        editor.setValue(JSON.stringify(source_content, null, 4));
        editor.layout();
    }
    console.log("updating data...", source_content);
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
<div id="controls">
    {#each controls as control (key)}
    <button id="{key}" on:click={control}>{key.toUpperCase()}</button>
    {/each}
</div>
<div id="editorRoot" on:didFocusEditorText={() => editor.layout() }></div>

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
