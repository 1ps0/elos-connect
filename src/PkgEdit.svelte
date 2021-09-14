<script>

// export let package = {};

import * as monaco from 'monaco-editor';

// "../node_modules/monaco-editor/min/vs/loader.js"
// "../node_modules/monaco-editor/min/vs/editor/editor.main.nls.js"
// "../node_modules/monaco-editor/min/vs/editor/editor.main.js"

let editor = monaco.editor.create(document.getElementById('container'), {
    value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
    language: 'javascript'
});

</script>


<div id="container" style="width: 800px; height: 600px; border: 1px solid grey">

</div>

<style>
</style>
