<script>

import Overview from "./Overview.svelte";
import { onMount } from 'svelte';

const axios = require('axios');
onMount(async () => {});

</script>

<div id="main">
    <p class="title">
        <span class="header">
            eLOS Dashboard
        </span>
        <span class="datetime">
            {(new Date()).toLocaleDateString()}
             |
            {(new Date()).toLocaleTimeString()}
        </span>
    </p>
    <Overview />
    <hr/>
</div>


<style>

.title {
    background-color: #ccc;
    color: #444;
    cursor: pointer;
    padding: 18px;
    width: 96%;
    border: none;
    outline: none;
}

.header {
    text-align: left;
    border: 1px solid black;
    padding: 10px 20px 10px 20px;
}

.datetime {
    font-size: 20px;
    padding: 10px;
}

</style>
