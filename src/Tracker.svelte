<script>
/*
(THIS IS BASICALLY A TAB BAR)
Track files that are actively open or 'pinned' or 'favorited'
CRUD ops
Open related
Reopen or minimize to Tracker
*/
import { onMount, setContext, getContext, hasContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

import { _fetch, updateFiletype, openFile } from "./lib/apis.js";
import { stores } from "./lib/stores.js"

/*
1. link handling
- field to dump a link
- add category or tag name to link
- links get added to default package
- save package to local

2. file transfer/saving
- settings has default file handling
- fileio drag to drop a file
- save file to configured location
-

3. youtube-dl trigger
- field to dump link
- toggle data types wanted (video, audio, subs, metadata, etc)
- trigger and add resulting file to tracked package list (?)

4.
*/

</script>

<section>

</section>

<style>
</style>
