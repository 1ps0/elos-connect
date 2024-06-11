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

const gotoTabAndWindow = args => {
  // args are [tabId, windowId]
  return Promise.resolve(args)
    // .then(_args => args[0])
    .then(parseInputs)
    .then(proxy.print.status_goto)
    .then(_ids => {
      browser.windows.update(_ids[1], {focused: true})
      return _ids[0]
    })
    .then(_id => browser.tabs.update(_id, {active: true}))
    .catch(proxy.print.failure_goto_tab_and_window);
}

let _cmds = {};
try {
  _cmds = {
    gather: {
      content: 'gather',
      description: 'move input|all tabs to current|new window',
      action: args => {
        // args in ('all', '<domain>', <tag>, ilike <title>, type: video, audio, article)
        let _tabs = Promise.resolve(args)
          .then(tabs.filter)
          .then((_tabs) => _tabs.map((tab) => tab.id))
          .catch(proxy.print.failure_get_filtered_tabs);

        return Promise.resolve({
          top: 0,
          left: 0,
          width: window.screen.width / 2,
          height: window.screen.height,
        })
          .then(browser.windows.create)
          .then((_window) => {
            return tabs.move(_tabs, _window);
          })
          .catch(proxy.print.failure_gather);
      },
      suggestions: args => {
        return Promise.resolve(args)
          .catch(proxy.print.failure_suggestions_gather)
      }
    },
    playing: {
      content: 'List playing tabs',
      description: 'A suggestion list of playing tabs. Select to GOTO.',
      action: (args) => {
        return Promise.resolve(args)
          .then(gotoTabAndWindow)
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
      history: {
        content: 'history of playing',
        description: 'history of playing',
        action: args => {
          return Promise.resolve(args)
            .then(gotoTabAndWindow)
            .catch(proxy.print.failure_playing_goto);
        },
        suggestions: args => {
          return Promise.resolve(args)
          .then(proxy.print.status_suggestions_playing)
          .catch(proxy.print.failure_suggestions_playing);

        }
      }
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
