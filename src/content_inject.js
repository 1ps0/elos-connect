
console.log("LOADING ELOS CONNECT - content_inject.js");

/*
GOALS

1. identify sites that match a BS strategy
2. retrieve state of tabs with identified sites
3. enable control of identified tabs through identified strategy

extras:
- infer dark mode
- extract article text
-

*/

/*
## PLAYABLE-ness

```
{
  baseURI:str
  muted:bool, volume:float
  playbackRate:int
  currentTime:float, duration:float
  loop:bool, ended:bool, autoplay:bool, paused:bool
  play:(), pause:(),
}
```

> BS interface:
```
version
displayName
accepts: { method:None, format: "%K LIKE *site*", args: ["URL"] }
isPlaying
toggle
previous
next
pause
favorite
trackInfo: { image, track, artist, progress, favorited }
```


*/

function getPlayable() {
  let elTypes = ['video', 'audio'];
  let el = null;
  let elType = null;
  elTypes.forEach( _type => {
    var _el = document.querySelector(_type);
    if (_el) {
      el = _el;
      elType = _type;
    }
  });

  if (el) { // && el.duration > 0
    return [elType, el];
  }

  return [];
}

function playPause() {
  let el = getPlayable();
  if (el.paused) { el.play(); }
  else { el.pause(); }
}

function isMuted() {
  return getPlayable().muted;
}

function getCurrentTime() {
  return [getPlayable().currentTime, getPlayable().duration];
}

function notifyExtension(e) {
  if (e.target.tagName !== "A") {
    return;
  }
  browser.runtime.sendMessage({"url": e.target.href});
}

// window.addEventListener("click", notifyExtension);

// let myPort = browser.runtime.connect({name:"port-from-cs"});
// myPort.postMessage({greeting: "hello from content script"});

// myPort.onMessage.addListener(function(m) {
//   console.log("In content script, received message from background script: ");
//   console.log(m.greeting);
// });

// document.body.addEventListener("click", function() {
//   myPort.postMessage({greeting: "they clicked the page!"});
// });
