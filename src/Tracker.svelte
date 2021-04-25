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



</script>

<section>

</section>

<style>
</style>
