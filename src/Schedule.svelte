<script>
// import {fetchFromLocalStorage, saveToLocalStorage} from "./storage.js";
import jquery from './jquery-1.11.1.js';

export let days = ["M", "T", "W", "Th", "F", "Sa", "Su"];

// from 9a to 10p
export let hours = ["9","10","11","12","13","14","15","16","17","18","19","20","21","22"];
export let items = {}

export let dayPointer = 0; // offset from current day
export let dayWindow = 1; // count of days to show

$: dayPointer;

$: dayWindow;

const fetchFromLocalStorage = (item) => {
    return JSON.parse(localStorage.getItem(item));
};

const saveToLocalStorage = (item, value) => {
    localStorage.setItem(item, JSON.stringify(value));
};

console.log('--', fetchFromLocalStorage("test", new Date()));
// saveToLocalStorage("test", new Date());
// alert(fetchFromLocalStorage("test"));


</script>

<table class="calendar">
<tr>
    <td><button on:click={() => dayPointer = 0 }>Current</button></td>
    <td><button on:click={() => dayWindow = 1 }>Day</button></td>
    <td><button on:click={() => dayWindow = 7 }>Week</button></td>

</tr>
<tr>
    <th>Time</th>
    {#each days as day}
    <th>{day}</th>
    {/each}
</tr>
{#each hours as hour}
    <tr>
        <th class="hour-item title">{hour}:00</th>
        {#each days as day}
            {#if hour in items}
            <td class="hour-item active">{items[hour]}</td>
            {:else}
            <td class="hour-item empty">-</td>
            {/if}
        {/each}
    </tr>
{/each}
</table>

<style>

.title {

}

.active {

}

.empty {

}

.hour-item {

}

.calendar {

}

</style>
