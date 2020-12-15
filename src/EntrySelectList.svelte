<script>
import { onMount, createEventDispatcher, getContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

const axios = require('axios');
const dispatch = createEventDispatcher();
const filetypeContext = getContext("filetypes");

/*
basically make it a selectable todo with add entry at the top.
select to trigger an event
config panel to edit event
use entryform to edit event
so we need to reduce entry form fields necessary into an event
and send that event through config structure to the target component

*/

</script>

<section>

</section>

<style>
</style>
