<script>
import { onMount } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { commandOptionsWritable} from "./lib/stores.js";
import { commandLine } from "./lib/commandLine.js";

import AutoComplete from './AutoComplete.svelte';

const tagColors = ['#000', '#3298dc', '#f14668', '#48c774', '#3273dc']
const searchModifiers = ['cmd', 'files', 'do', 'panel', 'profile', 'settings']

export let options = [];
export let selectedOptions = [];

/*
let cmds = {
  'search': {
    'url': '',
    'tag': '',
    'title': '',
    'query': '', // freeform, for triplet, vector, or other arbitrary search google style
  },
  'set': {
    'default': {
      'open': {}
    },
    'keymap': {
      'sidebar': '',
      'popup': '',
      'options': '',
    }
  },
  'open': {
    'package': {
      'index': '',
      'current': '',
      'mark_as_completed': '',
      'next': '',
      'reset': '',
    },
    'panel': '',
    'sidebar': {
      'all',
      'timer',
      'actionmenu',
    },
    'options': '',
  },
  'copy': {
    'tabs': '',
    'target': '',
  },
  'save': {
    'page': {
      'tag',
    },
    'video': {},
    'song': {}
  },
  'window': {
    'flatten': '',
    'split_by_tag': '',
    'collect_by_tag': ''
  },
  'track': {
    'add': '',
    'set_cycle': '',
    'show_as': ''
  },
  'timer': {
    'start': '',
    'pause': '',
    'reset': '',
    'lap': '',
  },
  'options': '',
  'help': {
    'about',
    'changelog',
    'documentation',
    'check_for_updates',
    'worker_status'
  },
  'history': {
    'last_actions',
    'undo_close',

  },
  'convert': {
    'csv_to_json',
    'json_to_csv',

  },
  'package': {
    'add_channel',
    'update_channel',
    'list_channel',
    'remove_channel',
    'add_index',
    'update_index',
    'list_index',
    'remove_index',
    'list_installed',
    'create_package',
    'install_package',
    'update_package',
    'uninstall_package',
    'set_debug',
    'discover',
    'search',
  }
};
*/
commandOptionsWritable.subscribe(val => {
  console.log("history", val.history())
});

const _handleSubmit = (selectedValue, category) => {
  if (options.indexOf(selectedValue) === -1) {
    options = [...options, selectedValue]
  }
  if (selectedOptions.indexOf(selectedValue) === -1) {
    selectedOptions = [...selectedOptions, selectedValue]
  }
}
const handleSubmit = (e) => {
  _handleSubmit(e.selected, searchModifiers);
};

onMount(async () => {
  console.log('CommandBar mounted');
});

</script>

<section class="title">
  <span class="header" use:commandLine={commandOptionsWritable}>
    <AutoComplete
      {options}
      {searchModifiers}
      onSubmit={handleSubmit}
      themeColor={tagColors[4]}
    />

  </span>
</section>

<style>

.header {
}

.title {
  color: #444;
  width: 100%;
  padding: 4.5px;
}

 /* Style the search box */
#search {
  /*width: 90%;*/
  font-size: 16px;
  text-align: left;
  /*float: left;*/
}


</style>