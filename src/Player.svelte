<style>
#player {
  width: 640px;
  height: 360px;
}

#controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#controls button {
  border: none;
  background-color: lightgray;
  color: white;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
}

#controls button:hover {
  background-color: gray;
}
</style>

<script>

  const player = document.getElementById("player");
const playPauseButton = document.getElementById("play-pause");
const muteUnmuteButton = document.getElementById("mute-unmute");
const enterExitPipButton = document.getElementById("enter-exit-pip");

playPauseButton.addEventListener("click", () => {
  if (player.paused) {
    player.play();
  } else {
    player.pause();
  }
});

muteUnmuteButton.addEventListener("click", () => {
  if (player.muted) {
    player.muted = false;
  } else {
    player.muted = true;
  }
});

enterExitPipButton.addEventListener("click", () => {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture().then(() => {
      console.log("Exited Picture-in-Picture mode");
    });
  } else {
    player.requestPictureInPicture().then(() => {
      console.log("Entered Picture-in-Picture mode");
    });
  }
});

</script>

<section>
<!-- The player element will contain the video or audio to be played -->
<video id="player" src="" controls></video>

<!-- The controls element will contain buttons for controlling the player -->
<div id="controls">
  <button id="play-pause">Play/Pause</button>
  <button id="mute-unmute">Mute/Unmute</button>
  <button id="enter-exit-pip">Enter/Exit Picture-in-Picture</button>
</div>
</section>
