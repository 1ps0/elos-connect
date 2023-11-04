// ------ Commands
// for commands invoked by omnibox or configured shortcut

/*
    "MediaNextTrack"
    "MediaPlayPause"
    "MediaPrevTrack"
    "MediaStop"
*/
export const setupCommands = (params) => {
  browser.commands.onCommand.addListener(function (command) {
    if (command === 'toggle-feature') {
      console.log('Toggling the feature!');
    }
  });
};
