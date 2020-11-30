<script>

// import Overview from "./Overview.svelte";
import { onMount } from 'svelte';

let dayNow, timeNow;
$: dayNow = (new Date()).toLocaleDateString();
$: timeNow = (new Date()).toLocaleTimeString();

onMount(async () => {
    console.log('Dashboard mounted');
});

</script>

<div id="main">
    <p class="title">
        <span class="header">
            eLOS Dashboard
        </span>
        <span class="datetime">{dayNow} | {timeNow}</span>
        <img src="img/img_avatar.png" alt="Avatar" class="avatar">
    </p>
    <!-- <Overview /> -->
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

.avatar {
  vertical-align: middle;
  width: 30px;
  height: 30px;
  float: right;
  border-radius: 50%;
}
</style>
