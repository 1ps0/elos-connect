
// import Tagset from "./Tagset.svelte";
import Timer from "./Timer.svelte";
import Options from "./Options.svelte";
import Toolbar from "./Toolbar.svelte";
import Clock from "./Clock.svelte";
import Profile from "./Profile.svelte";
import Todo from "./Todo.svelte";
import Config from "./Config.svelte";

import ActionMenu from "./ActionMenu.svelte";
import SpotifyControls from "./SpotifyControls.svelte";
import LocationOps from "./LocationOps.svelte";
import WebPlayers from "./WebPlayers.svelte";
import Playlists from "./Playlists.svelte";
import Focus from "./Focus.svelte";

import Chart from "./Chart.svelte";
import ExpandList from "./ExpandList.svelte";
import ItemList from "./ItemList.svelte";
import SelectList from "./SelectList.svelte";
import Files from "./Files.svelte";
import DropSite from "./DropSite.svelte";
import DataPanel from "./DataPanel.svelte";
import EntryForm from "./EntryForm.svelte";
import ImageGallery from "./ImageGallery.svelte";
import TemplatePanel from "./TemplatePanel.svelte";
import PkgIndex from "./PkgIndex.svelte";
import PkgCreate from "./PkgCreate.svelte";

import Dashboard from "./Dashboard.svelte";

export const components = {
    "dashboard": Dashboard,
    "options": Options,
    "toolbar": Toolbar,
    "focus": Focus,
    "timer": Timer,
    "clock": Clock,
    "profile": Profile,
    "config": Config,
    "todo": Todo,
    "chart": Chart,
    "expandlist": ExpandList,
    "itemlist": ItemList,
    "selectlist": SelectList,
    "files": Files,
    "drop": DropSite,
    "actionmenu": ActionMenu,
    "spotify_controls": SpotifyControls,
    "location_ops": LocationOps,
    "web_players": WebPlayers,
    "playlists": Playlists,
    // "template": TemplatePanel, // for templating via storybook
    // "status": NotifSite,
    // "session": Session,
    "dataPanel": DataPanel,
    "entryform": EntryForm,
    "imagegallery": ImageGallery,
    "pkgindex": PkgIndex,
    "pkgcreate": PkgCreate,
};

