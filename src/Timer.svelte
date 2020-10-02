<script>

let timer = 0;
$: timer;

let history = [];
$: history;

const addInterval = (time) => {
    history += time;
};

const removeInterval = (tar) => {  };
const startTimer = () => {};
const resetTimer = () => {};
const pauseTimer = () => {};
const lapTimer = () => {
    console.log('lapped', timer);
    addInterval(timer);
    timer = 0;
};


</script>

<section class="timer-container">

    <h4>Timer</h4>
    <div class="control">
        <p>{timer}</p>
        <p><button on:click={startTimer}>Start</button></p>
        <p><button on:click={resetTimer}>Reset</button></p>
        <p><button on:click={pauseTimer}>Pause</button></p>
        <p><button on:click={lapTimer}>Lap</button></p>
    </div>
    <hr/>
    <div class="history">
        {#each history as event}
            <div class="interval">{event}</div>
        {/each}
    </div>

</section>

<style>

.timer-container section{
    border: 1px solid black;
    padding: 20px;/*
    display: flex;*/
}

div.control {
    border: 1px solid black;
    padding: 20px;
}

div.history {
    padding: 10px;
}

div.interval {
    background-color: #56CCF2;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 2px;
}

</style>
