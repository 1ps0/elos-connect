<script>
// import { writable, readable, derived, get } from "svelte/store";
import { onMount } from 'svelte';

export let watcher;
export let selectValue = null;

let data = {
    label: "",
    options: [],
    value: null
};

$: {
    if (watcher && selectValue) {
        watcher.update(n => {
            // console.log('updated Selected', n);
            n.value = selectValue;
            return n;
        })
    }
}

onMount(async () => {
    console.log('Select mounted');
    if (watcher) {
        watcher.subscribe( (val) => {
            // console.log("SELECT watcher", val);
            if (val) {
                data = val;
            }
        });
    }
});

</script>

<div>
    <label>{data.label}</label>
    <select bind:value={selectValue}>
        {#each data.options as opt}
            <option value={opt}>{opt.name}</option>
        {/each}
    </select>
</div>

<style>
</style>
