<script>

import { onMount } from 'svelte';

export let url = "";
export let video_type = "video/mp4";

let video;
let controls;

function togglePause() {
  if (video.paused) {
    video.play();
    controls.innerHTML = "Pause";
  } else {
    video.pause();
    controls.innerHTML = "Play";
  }
}

onMount(async () => {
    console.log("VideoPlayer mounted");
    video = document.getElementById("player");
    controls = document.getElementById("controls");
});

</script>

<section>
    <div id="controls"></div>
    <video autoplay muted loop id="player">
        <source src="{url}" type="{video_type}">
        Your browser does not support HTML5 video.
    </video>
</section>

<style>

section {
    margin: 0;
}

video {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  min-width: 100%;
  min-height: 100%;
}
</style>
