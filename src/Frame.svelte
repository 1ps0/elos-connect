<script>

import { onMount } from 'svelte';

//"docs/A teleosemantic approach to information in the brain.pdf"
export let viewer_file = "docs/A teleosemantic approach to information in the brain.pdf#page=4";
$: viewer_file = `/api/load?filepath=${viewer_file}`;


onMount(() => {
  console.log('Frame mounted');
});

</script>

<div id="container">
    <iframe src={viewer_file}></iframe>
</div>

<style>

#container {}

iframe {
    display: block;       /* iframes are inline by default */
    background: #000;
    border: none;         /* Reset default border */
    resize: height;
    height: 70vh;        /* Viewport-relative units */
    width: 95%;
    overflow: auto;
}

.fullscreen {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    border: none;
    margin: 0 auto;
    padding: 0;
    overflow: hidden;
    z-index: 999999;
}

</style>
