// main cli command structure

import { panelTypes } from '../config/panels.js';

import * as bookmarks from './apis/bookmarks.js';
import * as util from './apis/util.js';
import * as proxy from './apis/proxy.js';
import * as reduce from './apis/reduce.js';
import * as network from './apis/network.js';
import * as storage from './apis/storage.js';
import * as tabs from './apis/tabs.js';
import * as windows from './apis/windows.js';

import * as actions from './actions.js';
import * as send from './send.js';
import { stores } from './stores.js';

proxy.print.load_omnibox();

function isStringifiedInteger(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return /^-?\d+$/.test(value) && !isNaN(Number(value));
}
const parseInputs = (_input) => {
  return Promise.resolve(_input)
    .then(values => {
      return values.map(value => {
        return isStringifiedInteger(value) ? parseInt(value) : value
      })
    })
    .catch(proxy.print.failure_parse_input_action)
}

let _cmds = {};
try {
  _cmds = {
    playing: {
      content: 'List playing tabs',
      description: 'A suggestion list of playing tabs. Select to GOTO.',
      action: (args) => {
        return Promise.resolve(args)
          // .then(_args => args[0])
          .then(parseInputs)
          .then(proxy.print.status_playing)
          .then(_ids => {
            // [tabId, windowId]
            browser.windows.update(_ids[1], {focused: true})
            return _ids[0]
          })
          .then(_id => browser.tabs.update(_id, {active: true}))
          .catch(proxy.print.failure_playing_goto);
      },
      suggestions: (args) => {
        return Promise.resolve({
          audible: true,
        })
        .then(browser.tabs.query)
        .then(reduce.tabs)
        .then((_tabs) => {
          return reduce.playing(_tabs, {})
        })
        .then(Object.values)
        .then(proxy.print.status_suggestions_playing)
        .catch(proxy.print.failure_suggestions_playing);
      },
      // {
      //   name: 'show',
      //   description: '',
      //   check: (obj) => true,
      //   icon: () => 'Show',
      //   action: actions.bringToFront
      // },
      // {
      //   name: 'playPause',
      //   description: '',
      //   check: (obj) => obj.playing,
      //   icon: (obj) => {
      //     return obj.playing ? 'Pause' : 'Play';
      //   },
      //   action: send.playPause
      // },
      // {
      //   name: 'toggleLoop',
      //   description: '',
      //   check: (obj) => obj.loop,
      //   icon: (obj) => {
      //     return obj.loop ? 'LOOPING' : 'SINGLE';
      //   },
      //   action: send.toggleLoop
      // },
      // {
      //   name: 'next',
      //   description: '',
      //   check: (obj) => null,
      //   icon: () => "NEXT",
      //   action: send.clickNext
      // }
    }
  };
} catch (err) {
  proxy.print.failure_omnibox(err);
}

export const cmds = _cmds;
console.log('cmds', cmds);
