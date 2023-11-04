// import Tagset from "./Tagset.svelte";
import Timer from './Timer.svelte';
import Todo from './Todo.svelte';
import Config from './Config.svelte';

import ActionMenu from './ActionMenu.svelte';
import WebPlayers from './WebPlayers.svelte';
import Playlists from './Playlists.svelte';
import Focus from './Focus.svelte';

import ExpandList from './ExpandList.svelte';
import ItemList from './ItemList.svelte';
import SelectList from './SelectList.svelte';
import EntryForm from './EntryForm.svelte';

import Dashboard from './Dashboard.svelte';

export const components = {
  dashboard: Dashboard,
  focus: Focus,
  timer: Timer,
  config: Config,
  todo: Todo,
  expandlist: ExpandList,
  itemlist: ItemList,
  selectlist: SelectList,
  actionmenu: ActionMenu,
  web_players: WebPlayers,
  playlists: Playlists,
  entryform: EntryForm,
};
